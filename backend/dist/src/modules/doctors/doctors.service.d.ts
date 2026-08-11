import { PrismaService } from '../../database/prisma.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { ReviewDoctorApplicationDto } from './dto/review-doctor-application.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DoctorsService {
    private readonly prisma;
    private readonly auditLogsService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService, notificationsService: NotificationsService);
    registerDoctor(dto: RegisterDoctorDto): Promise<{
        message: string;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.DoctorStatus;
    }>;
    findPublicDoctors(specialtyId?: string, search?: string): Promise<{
        id: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
        bio: string | null;
        experienceYears: number;
        education: string | null;
        consultationFee: import("@prisma/client/runtime/library").Decimal;
        averageRating: import("@prisma/client/runtime/library").Decimal;
        totalReviews: number;
        verificationStatus: import(".prisma/client").$Enums.DoctorStatus;
        isOnline: boolean;
        specialties: ({
            specialty: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                iconUrl: string | null;
                createdAt: Date;
            };
        } & {
            specialtyId: string;
            doctorProfileId: string;
        })[];
        availabilities: {
            id: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            slotDurationMinutes: number;
            isAvailable: boolean;
            doctorProfileId: string;
        }[];
    }[]>;
    findPublicDoctorById(id: string): Promise<{
        id: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
        bio: string | null;
        experienceYears: number;
        education: string | null;
        consultationFee: import("@prisma/client/runtime/library").Decimal;
        averageRating: import("@prisma/client/runtime/library").Decimal;
        totalReviews: number;
        verificationStatus: import(".prisma/client").$Enums.DoctorStatus;
        isOnline: boolean;
        specialties: ({
            specialty: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                iconUrl: string | null;
                createdAt: Date;
            };
        } & {
            specialtyId: string;
            doctorProfileId: string;
        })[];
        availabilities: {
            id: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            slotDurationMinutes: number;
            isAvailable: boolean;
            doctorProfileId: string;
        }[];
        reviewsReceived: {
            id: string;
            createdAt: Date;
            rating: number;
            comment: string;
            patient: {
                firstName: string;
                lastName: string;
            };
        }[];
    }>;
    updateOwnProfile(userId: string, dto: UpdateDoctorProfileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        licenseNumber: string;
        bio: string | null;
        experienceYears: number;
        education: string | null;
        consultationFee: import("@prisma/client/runtime/library").Decimal;
        averageRating: import("@prisma/client/runtime/library").Decimal;
        totalReviews: number;
        verificationStatus: import(".prisma/client").$Enums.DoctorStatus;
        rejectionReason: string | null;
        isOnline: boolean;
    }>;
    findPendingApplications(): Promise<({
        doctorProfile: {
            user: {
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
            };
            documents: {
                id: string;
                doctorProfileId: string;
                documentType: string;
                fileUrl: string;
                originalName: string;
                uploadedAt: Date;
            }[];
            specialties: ({
                specialty: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    iconUrl: string | null;
                    createdAt: Date;
                };
            } & {
                specialtyId: string;
                doctorProfileId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            licenseNumber: string;
            bio: string | null;
            experienceYears: number;
            education: string | null;
            consultationFee: import("@prisma/client/runtime/library").Decimal;
            averageRating: import("@prisma/client/runtime/library").Decimal;
            totalReviews: number;
            verificationStatus: import(".prisma/client").$Enums.DoctorStatus;
            rejectionReason: string | null;
            isOnline: boolean;
        };
    } & {
        id: string;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.DoctorStatus;
        notes: string | null;
        submittedAt: Date;
        reviewedAt: Date | null;
        reviewedBy: string | null;
    })[]>;
    reviewDoctorApplication(adminUserId: string, doctorProfileId: string, dto: ReviewDoctorApplicationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        licenseNumber: string;
        bio: string | null;
        experienceYears: number;
        education: string | null;
        consultationFee: import("@prisma/client/runtime/library").Decimal;
        averageRating: import("@prisma/client/runtime/library").Decimal;
        totalReviews: number;
        verificationStatus: import(".prisma/client").$Enums.DoctorStatus;
        rejectionReason: string | null;
        isOnline: boolean;
    }>;
}
