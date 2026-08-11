import { CreatePaymentInput, PaymentInitResult, PaymentProvider, WebhookValidationResult } from '../../../common/interfaces/payment-provider.interface';
export declare class MockPaymentProvider implements PaymentProvider {
    readonly providerName = "MOCK";
    createPayment(input: CreatePaymentInput): Promise<PaymentInitResult>;
    verifyWebhook(headers: Record<string, any>, body: any): Promise<WebhookValidationResult>;
}
