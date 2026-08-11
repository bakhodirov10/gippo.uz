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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const password_util_1 = require("../../common/utils/password.util");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const notifications_service_1 = require("../notifications/notifications.service");
let DoctorsService = class DoctorsService {
    constructor(prisma, auditLogsService, notificationsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
        this.notificationsService = notificationsService;
    }
    async registerDoctor(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const existingLicense = await this.prisma.doctorProfile.findUnique({
            where: { licenseNumber: dto.licenseNumber },
        });
        if (existingLicense) {
            throw new common_1.ConflictException('Doctor profile with this license number already exists');
        }
        const passwordHash = await password_util_1.PasswordUtil.hashPassword(dto.password);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    phone: dto.phone,
                    role: client_1.Role.DOCTOR,
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
                    verificationStatus: client_1.DoctorStatus.PENDING,
                    specialties: {
                        create: dto.specialtyIds.map((specialtyId) => ({
                            specialty: { connect: { id: specialtyId } },
                        })),
                    },
                },
            });
            await tx.doctorLedger.create({
                data: {
                    doctorProfileId: doctorProfile.id,
                },
            });
            await tx.doctorApplication.create({
                data: {
                    doctorProfileId: doctorProfile.id,
                    status: client_1.DoctorStatus.PENDING,
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
    async findPublicDoctors(specialtyId, search) {
        const where = {
            verificationStatus: client_1.DoctorStatus.APPROVED,
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
    async findPublicDoctorById(id) {
        const doctor = await this.prisma.doctorProfile.findFirst({
            where: {
                id,
                verificationStatus: client_1.DoctorStatus.APPROVED,
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
            throw new common_1.NotFoundException('Doctor not found or not approved');
        }
        return doctor;
    }
    async updateOwnProfile(userId, dto) {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { userId },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        return this.prisma.doctorProfile.update({
            where: { id: doctorProfile.id },
            data: dto,
        });
    }
    async findPendingApplications() {
        return this.prisma.doctorApplication.findMany({
            where: { status: client_1.DoctorStatus.PENDING },
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
                        documents: true,
                    },
                },
            },
        });
    }
    async reviewDoctorApplication(adminUserId, doctorProfileId, dto) {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { id: doctorProfileId },
            include: { user: true },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        const updatedDoctor = await this.prisma.$transaction(async (tx) => {
            const profile = await tx.doctorProfile.update({
                where: { id: doctorProfileId },
                data: {
                    verificationStatus: dto.status,
                    rejectionReason: dto.status === client_1.DoctorStatus.REJECTED ? dto.reason : null,
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
            body: dto.status === client_1.DoctorStatus.APPROVED
                ? 'Congratulations! Your doctor profile has been approved. You are now visible in the Gippo directory.'
                : `Your application status updated to ${dto.status}. Reason: ${dto.reason || 'N/A'}`,
        });
        return updatedDoctor;
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_logs_service_1.AuditLogsService, notifications_service_1.NotificationsService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map