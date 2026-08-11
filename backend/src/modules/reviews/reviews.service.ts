import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AppointmentStatus } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import Decimal from 'decimal.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async createReview(patientUserId: string, dto: CreateReviewDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { review: true, doctorProfile: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patientId !== patientUserId) {
      throw new ForbiddenException('You can only review your own appointments');
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Reviews are only allowed for COMPLETED appointments');
    }

    if (appointment.review) {
      throw new ConflictException('A review has already been submitted for this appointment');
    }

    const review = await this.prisma.$transaction(async (tx) => {
      // 1. Create Review
      const newReview = await tx.review.create({
        data: {
          appointmentId: appointment.id,
          patientId: patientUserId,
          doctorProfileId: appointment.doctorProfileId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // 2. Recalculate Doctor Average Rating strictly on Backend
      const aggregate = await tx.review.aggregate({
        where: { doctorProfileId: appointment.doctorProfileId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const avgRating = new Decimal(aggregate._avg.rating || dto.rating).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const totalReviews = aggregate._count.rating || 1;

      await tx.doctorProfile.update({
        where: { id: appointment.doctorProfileId },
        data: {
          averageRating: avgRating.toFixed(2),
          totalReviews,
        },
      });

      return newReview;
    });

    await this.auditLogsService.log({
      actorId: patientUserId,
      action: 'DOCTOR_REVIEW_SUBMITTED',
      entity: 'Review',
      entityId: review.id,
      metadata: { rating: dto.rating, doctorProfileId: appointment.doctorProfileId },
    });

    return review;
  }

  async getDoctorReviews(doctorProfileId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where: { doctorProfileId } }),
      this.prisma.review.findMany({
        where: { doctorProfileId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
