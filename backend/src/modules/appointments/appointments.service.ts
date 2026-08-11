import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentPaymentStatus, AppointmentStatus, DoctorStatus } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createAppointment(patientUserId: string, dto: CreateAppointmentDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const now = new Date();

    if (start <= now) {
      throw new BadRequestException('Cannot book appointment in the past');
    }

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Verify doctor exists and is APPROVED
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { id: dto.doctorProfileId },
      include: { user: true, availabilities: true },
    });

    if (!doctor || doctor.verificationStatus !== DoctorStatus.APPROVED) {
      throw new BadRequestException('Doctor is not available or not verified');
    }

    // Check doctor availability for the given day of week & time range
    const dayOfWeek = start.getUTCDay(); // 0 = Sunday
    const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();

    const isWithinSchedule = doctor.availabilities.some((avail) => {
      if (!avail.isAvailable || avail.dayOfWeek !== dayOfWeek) return false;

      const [schedStartH, schedStartM] = avail.startTime.split(':').map(Number);
      const [schedEndH, schedEndM] = avail.endTime.split(':').map(Number);

      const schedStartTotal = schedStartH * 60 + schedStartM;
      const schedEndTotal = schedEndH * 60 + schedEndM;

      return startMinutes >= schedStartTotal && endMinutes <= schedEndTotal;
    });

    // If no explicit schedule configured, fall back to checking if doctor disabled availability
    if (doctor.availabilities.length > 0 && !isWithinSchedule) {
      throw new BadRequestException(
        'Selected time slot falls outside doctor working hours',
      );
    }

    // Atomic Double Booking check inside transaction
    const appointment = await this.prisma.$transaction(async (tx) => {
      // Find overlapping appointments where status != CANCELLED
      const overlapping = await tx.appointment.findFirst({
        where: {
          doctorProfileId: dto.doctorProfileId,
          status: { not: AppointmentStatus.CANCELLED },
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (overlapping) {
        throw new ConflictException(
          'Doctor is already booked for the selected time slot. Please choose another time.',
        );
      }

      // Create appointment
      const newAppointment = await tx.appointment.create({
        data: {
          patientId: patientUserId,
          doctorProfileId: dto.doctorProfileId,
          startTime: start,
          endTime: end,
          price: doctor.consultationFee,
          status: AppointmentStatus.PENDING,
          paymentStatus: AppointmentPaymentStatus.UNPAID,
        },
      });

      // Create video consultation session
      const roomName = `gippo-room-${newAppointment.id.slice(0, 8)}-${Date.now()}`;
      const accessCode = uuidv4().slice(0, 8);

      await tx.consultation.create({
        data: {
          appointmentId: newAppointment.id,
          roomName,
          accessCode,
        },
      });

      return newAppointment;
    });

    await this.auditLogsService.log({
      actorId: patientUserId,
      action: 'APPOINTMENT_BOOKED',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    await this.notificationsService.create({
      userId: doctor.userId,
      title: 'New Appointment Booking Request',
      body: `You have a new appointment booking for ${start.toUTCString()}`,
    });

    return appointment;
  }

  async getUserAppointments(userId: string, role: string) {
    if (role === 'DOCTOR') {
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });
      if (!doctorProfile) return [];

      return this.prisma.appointment.findMany({
        where: { doctorProfileId: doctorProfile.id },
        orderBy: { startTime: 'desc' },
        include: {
          patient: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          consultation: true,
          payment: true,
          review: true,
        },
      });
    }

    // Patient
    return this.prisma.appointment.findMany({
      where: { patientId: userId },
      orderBy: { startTime: 'desc' },
      include: {
        doctorProfile: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specialties: { include: { specialty: true } },
          },
        },
        consultation: true,
        payment: true,
        review: true,
      },
    });
  }

  async getAppointmentById(id: string, userId: string, role: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        doctorProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        consultation: true,
        payment: true,
        review: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const isPatient = appointment.patientId === userId;
    const isDoctor = appointment.doctorProfile.user.id === userId;
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ForbiddenException('Access denied to this appointment');
    }

    return appointment;
  }

  async cancelAppointment(id: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { doctorProfile: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      appointment.patientId !== userId &&
      appointment.doctorProfile.userId !== userId
    ) {
      throw new ForbiddenException('You cannot cancel this appointment');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    await this.auditLogsService.log({
      actorId: userId,
      action: 'APPOINTMENT_CANCELLED',
      entity: 'Appointment',
      entityId: id,
    });

    return updated;
  }

  async completeAppointment(id: string, doctorUserId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!appointment || appointment.doctorProfileId !== doctorProfile.id) {
      throw new ForbiddenException('Doctor does not own this appointment');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMED && appointment.paymentStatus !== AppointmentPaymentStatus.PAID) {
      throw new BadRequestException('Only paid & confirmed appointments can be completed');
    }

    // Complete appointment and release pending earnings to doctor available balance
    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.COMPLETED },
      });

      if (appointment.payment) {
        // Move funds from pendingBalance to availableBalance in DoctorLedger
        const doctorAmount = appointment.payment.doctorAmount;
        const ledger = await tx.doctorLedger.findUnique({
          where: { doctorProfileId: doctorProfile.id },
        });

        if (ledger) {
          const newAvailable = Number(ledger.availableBalance) + Number(doctorAmount);
          const newPending = Math.max(0, Number(ledger.pendingBalance) - Number(doctorAmount));
          const newTotalEarnings = Number(ledger.totalEarnings) + Number(doctorAmount);

          await tx.doctorLedger.update({
            where: { id: ledger.id },
            data: {
              availableBalance: newAvailable,
              pendingBalance: newPending,
              totalEarnings: newTotalEarnings,
            },
          });

          await tx.ledgerEntry.create({
            data: {
              ledgerId: ledger.id,
              paymentId: appointment.payment.id,
              type: 'RELEASE_PENDING',
              amount: doctorAmount,
              balanceAfter: newAvailable,
              description: `Earnings released for completed appointment #${app.id.slice(0, 8)}`,
            },
          });
        }
      }

      return app;
    });

    await this.auditLogsService.log({
      actorId: doctorUserId,
      action: 'APPOINTMENT_COMPLETED',
      entity: 'Appointment',
      entityId: id,
    });

    await this.notificationsService.create({
      userId: appointment.patientId,
      title: 'Consultation Completed',
      body: 'Your medical consultation has been completed. Please leave a review for your doctor.',
    });

    return updated;
  }
}
