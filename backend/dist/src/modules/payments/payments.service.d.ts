import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly mockPaymentProvider;
    private readonly auditLogsService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, mockPaymentProvider: MockPaymentProvider, auditLogsService: AuditLogsService, notificationsService: NotificationsService);
    createPayment(patientUserId: string, dto: CreatePaymentDto): Promise<{
        paymentId: string;
        grossAmount: import("@prisma/client/runtime/library").Decimal;
        platformFee: import("@prisma/client/runtime/library").Decimal;
        doctorAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        paymentUrl: string;
    }>;
    handleWebhook(headers: Record<string, any>, body: any): Promise<{
        status: string;
        message: string;
    }>;
}
