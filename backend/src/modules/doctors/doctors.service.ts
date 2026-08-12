import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { ReviewDoctorApplicationDto } from './dto/review-doctor-application.dto';
import { DoctorStatus, Role } from '@prisma/client';
import { PasswordUtil } from '../../common/utils/password.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService, private readonly auditLogsService: AuditLogsService, private readonly notificationsService: NotificationsService) {}

  async registerDoctor(dto: RegisterDoctorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (dto.phone && dto.phone.trim()) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone.trim() },
      });

      if (existingPhone) {
        throw new ConflictException("Bu telefon raqami allaqachon ro'yxatdan o'tgan");
      }
    }

    const existingLicense = await this.prisma.doctorProfile.findUnique({
      where: { licenseNumber: dto.licenseNumber },
    });

    if (existingLicense) {
      throw new ConflictException('Doctor profile with this license number already exists');
    }

    const passwordHash = await PasswordUtil.hashPassword(dto.password);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: Role.DOCTOR,
        },
      });

      const doctorProfile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          bio: dto.bio,
          experienceYears: dto.experienceYears,
          education: dto.education,
          licenseNumber: dto.licenseNumber,
          consultationFee: dto.consultationFee,
          verificationStatus: DoctorStatus.PENDING,
          specialties: {
            create: dto.specialtyIds.map((specialtyId) => ({
              specialty: { connect: { id: specialtyId } },
            })),
          },
        },
      });

      // Initialize empty doctor ledger
      await tx.doctorLedger.create({
        data: {
          doctorProfileId: doctorProfile.id,
        },
      });

      // Create initial application record
      await tx.doctorApplication.create({
        data: {
          doctorProfileId: doctorProfile.id,
          status: DoctorStatus.PENDING,
        },
      });

      return { user, doctorProfile };
    });

    await this.auditLogsService.log({
      actorId: result.user.id,
      action: 'DOCTOR_APPLICATION_SUBMITTED',
      entity: 'DoctorProfile',
      entityId: result.doctorProfile.id,
    });

    return {
      message: 'Doctor application submitted successfully. Pending admin approval.',
      doctorProfileId: result.doctorProfile.id,
      status: result.doctorProfile.verificationStatus,
    };
  }

  async findPublicDoctors(specialtyId?: string, search?: string) {
    const where: any = {
      verificationStatus: DoctorStatus.APPROVED,
    };

    if (specialtyId) {
      where.specialties = {
        some: { specialtyId },
      };
    }

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const doctors = await this.prisma.doctorProfile.findMany({
      where,
      select: {
        id: true,
        bio: true,
        experienceYears: true,
        education: true,
        consultationFee: true,
        averageRating: true,
        totalReviews: true,
        verificationStatus: true,
        isOnline: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
        availabilities: true,
      },
    });

    return doctors;
  }

  async findPublicDoctorById(id: string) {
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: {
        id,
        verificationStatus: DoctorStatus.APPROVED,
      },
      select: {
        id: true,
        bio: true,
        experienceYears: true,
        education: true,
        consultationFee: true,
        averageRating: true,
        totalReviews: true,
        verificationStatus: true,
        isOnline: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        specialties: {
          include: {
            specialty: true,
          },
        },
        availabilities: true,
        reviewsReceived: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found or not approved');
    }

    return doctor;
  }

  async updateOwnProfile(userId: string, dto: UpdateDoctorProfileDto) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: dto,
    });
  }

  async findPendingApplications() {
    return this.prisma.doctorApplication.findMany({
      where: { status: DoctorStatus.PENDING },
      orderBy: { submittedAt: 'asc' },
      include: {
        doctorProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            specialties: {
              include: { specialty: true },
            },
            documents: true, // Admin gets to see documents for verification
          },
        },
      },
    });
  }

  async reviewDoctorApplication(
    adminUserId: string,
    doctorProfileId: string,
    dto: ReviewDoctorApplicationDto,
  ) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      include: { user: true },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    const updatedDoctor = await this.prisma.$transaction(async (tx) => {
      const profile = await tx.doctorProfile.update({
        where: { id: doctorProfileId },
        data: {
          verificationStatus: dto.status,
          rejectionReason: dto.status === DoctorStatus.REJECTED ? dto.reason : null,
        },
      });

      await tx.doctorApplication.create({
        data: {
          doctorProfileId,
          status: dto.status,
          reviewedBy: adminUserId,
          notes: dto.notes || dto.reason,
        },
      });

      return profile;
    });

    await this.auditLogsService.log({
      actorId: adminUserId,
      action: `ADMIN_REVIEW_DOCTOR_${dto.status}`,
      entity: 'DoctorProfile',
      entityId: doctorProfileId,
      metadata: { status: dto.status, reason: dto.reason, notes: dto.notes },
    });

    await this.notificationsService.create({
      userId: doctorProfile.userId,
      title: `Doctor Application Status: ${dto.status}`,
      body:
        dto.status === DoctorStatus.APPROVED
          ? 'Congratulations! Your doctor profile has been approved. You are now visible in the Gippo directory.'
          : `Your application status updated to ${dto.status}. Reason: ${dto.reason || 'N/A'}`,
    });

    return updatedDoctor;
  }
}
