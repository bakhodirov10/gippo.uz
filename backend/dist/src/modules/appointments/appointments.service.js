"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const uuid_1 = require("uuid");
let AppointmentsService = class AppointmentsService {
    constructor(prisma, auditLogsService, notificationsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
        this.notificationsService = notificationsService;
    }
    async createAppointment(patientUserId, dto) {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);
        const now = new Date();
        if (start <= now) {
            throw new common_1.BadRequestException('Cannot book appointment in the past');
        }
        if (end <= start) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        const doctor = await this.prisma.doctorProfile.findUnique({
            where: { id: dto.doctorProfileId },
            include: { user: true, availabilities: true },
        });
        if (!doctor || doctor.verificationStatus !== client_1.DoctorStatus.APPROVED) {
            throw new common_1.BadRequestException('Doctor is not available or not verified');
        }
        const dayOfWeek = start.getUTCDay();
        const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
        const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
        const isWithinSchedule = doctor.availabilities.some((avail) => {
            if (!avail.isAvailable || avail.dayOfWeek !== dayOfWeek)
                return false;
            const [schedStartH, schedStartM] = avail.startTime.split(':').map(Number);
            const [schedEndH, schedEndM] = avail.endTime.split(':').map(Number);
            const schedStartTotal = schedStartH * 60 + schedStartM;
            const schedEndTotal = schedEndH * 60 + schedEndM;
            return startMinutes >= schedStartTotal && endMinutes <= schedEndTotal;
        });
        if (doctor.availabilities.length > 0 && !isWithinSchedule) {
            throw new common_1.BadRequestException('Selected time slot falls outside doctor working hours');
        }
        const appointment = await this.prisma.$transaction(async (tx) => {
            const overlapping = await tx.appointment.findFirst({
                where: {
                    doctorProfileId: dto.doctorProfileId,
                    status: { not: client_1.AppointmentStatus.CANCELLED },
                    AND: [
                        { startTime: { lt: end } },
                        { endTime: { gt: start } },
                    ],
                },
            });
            if (overlapping) {
                throw new common_1.ConflictException('Doctor is already booked for the selected time slot. Please choose another time.');
            }
            const newAppointment = await tx.appointment.create({
                data: {
                    patientId: patientUserId,
                    doctorProfileId: dto.doctorProfileId,
                    startTime: start,
                    endTime: end,
                    price: doctor.consultationFee,
                    status: client_1.AppointmentStatus.PENDING,
                    paymentStatus: client_1.AppointmentPaymentStatus.UNPAID,
                },
            });
            const roomName = `gippo-room-${newAppointment.id.slice(0, 8)}-${Date.now()}`;
            const accessCode = (0, uuid_1.v4)().slice(0, 8);
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
    async getUserAppointments(userId, role) {
        if (role === 'DOCTOR') {
            const doctorProfile = await this.prisma.doctorProfile.findUnique({
                where: { userId },
            });
            if (!doctorProfile)
                return [];
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
    async getAppointmentById(id, userId, role) {
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
            throw new common_1.NotFoundException('Appointment not found');
        }
        const isPatient = appointment.patientId === userId;
        const isDoctor = appointment.doctorProfile.user.id === userId;
        const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
        if (!isPatient && !isDoctor && !isAdmin) {
            throw new common_1.ForbiddenException('Access denied to this appointment');
        }
        return appointment;
    }
    async cancelAppointment(id, userId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: { doctorProfile: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.patientId !== userId &&
            appointment.doctorProfile.userId !== userId) {
            throw new common_1.ForbiddenException('You cannot cancel this appointment');
        }
        if (appointment.status === client_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed appointment');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: client_1.AppointmentStatus.CANCELLED },
        });
        await this.auditLogsService.log({
            actorId: userId,
            action: 'APPOINTMENT_CANCELLED',
            entity: 'Appointment',
            entityId: id,
        });
        return updated;
    }
    async completeAppointment(id, doctorUserId) {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
            include: { payment: true },
        });
        if (!appointment || appointment.doctorProfileId !== doctorProfile.id) {
            throw new common_1.ForbiddenException('Doctor does not own this appointment');
        }
        if (appointment.status !== client_1.AppointmentStatus.CONFIRMED && appointment.paymentStatus !== client_1.AppointmentPaymentStatus.PAID) {
            throw new common_1.BadRequestException('Only paid & confirmed appointments can be completed');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const app = await tx.appointment.update({
                where: { id },
                data: { status: client_1.AppointmentStatus.COMPLETED },
            });
            if (appointment.payment) {
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
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService,
        notifications_service_1.NotificationsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map