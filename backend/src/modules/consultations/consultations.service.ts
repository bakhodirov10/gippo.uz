import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MockVideoProvider } from './providers/mock-video.provider';
import { ConsultationStatus } from '@prisma/client';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videoProvider: MockVideoProvider,
  ) {}

  async getSessionToken(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        consultation: true,
        patient: true,
        doctorProfile: { include: { user: true } },
      },
    });

    if (!appointment || !appointment.consultation) {
      throw new NotFoundException('Appointment or consultation session not found');
    }

    const isPatient = appointment.patientId === userId;
    const isDoctor = appointment.doctorProfile.user.id === userId;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('Only appointment patient or doctor can access video consultation');
    }

    const userName = isDoctor
      ? `Dr. ${appointment.doctorProfile.user.firstName} ${appointment.doctorProfile.user.lastName}`
      : `${appointment.patient.firstName} ${appointment.patient.lastName}`;

    const token = await this.videoProvider.generateToken({
      roomName: appointment.consultation.roomName,
      userId,
      userName,
      isDoctor,
    });

    // Update status to IN_PROGRESS if started
    if (appointment.consultation.status === ConsultationStatus.SCHEDULED) {
      await this.prisma.consultation.update({
        where: { id: appointment.consultation.id },
        data: {
          status: ConsultationStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
      });
    }

    return {
      consultationId: appointment.consultation.id,
      roomName: appointment.consultation.roomName,
      token,
      isDoctor,
      status: appointment.consultation.status,
    };
  }
}
