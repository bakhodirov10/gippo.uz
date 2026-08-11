export interface CreatePaymentInput {
  appointmentId: string;
  grossAmount: number;
  currency: string;
  patientId: string;
  description: string;
}

export interface PaymentInitResult {
  providerPaymentId: string;
  paymentUrl: string;
  status: string;
  rawResponse: any;
}

export interface WebhookValidationResult {
  isValid: boolean;
  appointmentId: string;
  providerPaymentId: string;
  amount: number;
  status: 'PAID' | 'FAILED' | 'CANCELLED';
  rawPayload: any;
}

export interface PaymentProvider {
  readonly providerName: string;
  createPayment(input: CreatePaymentInput): Promise<PaymentInitResult>;
  verifyWebhook(headers: Record<string, any>, body: any): Promise<WebhookValidationResult>;
}
