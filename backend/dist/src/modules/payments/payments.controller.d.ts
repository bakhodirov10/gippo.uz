import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
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
