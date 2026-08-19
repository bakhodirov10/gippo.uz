import { Injectable } from '@nestjs/common';
import {
  CreatePaymentInput,
  PaymentInitResult,
  PaymentProvider,
  WebhookValidationResult,
} from '../../../common/interfaces/payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly providerName = 'MOCK';

  async createPayment(input: CreatePaymentInput): Promise<PaymentInitResult> {
    const mockTransactionId = `mock_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const paymentUrl = `https://checkout.gippo.uz/pay/mock/${mockTransactionId}`;

    return {
      providerPaymentId: mockTransactionId,
      paymentUrl,
      status: 'PENDING',
      rawResponse: {
        provider: 'MOCK',
        amount: input.grossAmount,
        currency: input.currency,
        created: new Date().toISOString(),
      },
    };
  }

  async verifyWebhook(headers: Record<string, any>, body: any): Promise<WebhookValidationResult> {
    // In production, verify HMAC signature from headers
    const isValid = body?.status === 'SUCCESS' || body?.status === 'PAID';

    return {
      isValid: true,
      appointmentId: body.appointmentId,
      providerPaymentId: body.providerPaymentId || `mock_tx_${Date.now()}`,
      amount: Number(body.amount),
      status: isValid ? 'PAID' : 'FAILED',
      rawPayload: body,
    };
  }
}
