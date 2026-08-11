import { PrismaService } from '../../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AppointmentsService {
    private readonly prisma;
    private readonly auditLogsService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService, notificationsService: NotificationsService);
    createAppointment(patientUserId: string, dto: CreateAppointmentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        patientId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.AppointmentPaymentStatus;
    }>;
    getUserAppointments(userId: string, role: string): Promise<({
        consultation: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ConsultationStatus;
            appointmentId: string;
            roomName: string;
            accessCode: string;
            startedAt: Date | null;
            endedAt: Date | null;
        } | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            appointmentId: string;
            providerPaymentId: string | null;
            providerName: string;
            grossAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            doctorAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            rawWebhookPayload: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        review: {
            id: string;
            createdAt: Date;
            doctorProfileId: string;
            appointmentId: string;
            patientId: string;
            rating: number;
            comment: string;
        } | null;
        patient: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        patientId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.AppointmentPaymentStatus;
    })[] | ({
        doctorProfile: {
            user: {
                firstName: string;
                lastName: string;
            };
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
        consultation: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ConsultationStatus;
            appointmentId: string;
            roomName: string;
            accessCode: string;
            startedAt: Date | null;
            endedAt: Date | null;
        } | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            appointmentId: string;
            providerPaymentId: string | null;
            providerName: string;
            grossAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            doctorAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            rawWebhookPayload: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        review: {
            id: string;
            createdAt: Date;
            doctorProfileId: string;
            appointmentId: string;
            patientId: string;
            rating: number;
            comment: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        patientId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.AppointmentPaymentStatus;
    })[]>;
    getAppointmentById(id: string, userId: string, role: string): Promise<{
        doctorProfile: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
            };
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
        consultation: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ConsultationStatus;
            appointmentId: string;
            roomName: string;
            accessCode: string;
            startedAt: Date | null;
            endedAt: Date | null;
        } | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            appointmentId: string;
            providerPaymentId: string | null;
            providerName: string;
            grossAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            doctorAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            rawWebhookPayload: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        review: {
            id: string;
            createdAt: Date;
            doctorProfileId: string;
            appointmentId: string;
            patientId: string;
            rating: number;
            comment: string;
        } | null;
        patient: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        patientId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.AppointmentPaymentStatus;
    }>;
    cancelAppointment(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        patientId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.AppointmentPaymentStatus;
    }>;
    completeAppointment(id: string, doctorUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        doctorProfileId: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        patientId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: import(".prisma/client").$Enums.AppointmentPaymentStatus;
    }>;
}
