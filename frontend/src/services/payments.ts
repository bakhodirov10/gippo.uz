import { apiClient } from '@/lib/axios';
import { Payment } from '@/types';

export interface CreatePaymentPayload {
  appointmentId: string;
  providerName?: 'CLICK' | 'PAYME' | 'STRIPE' | 'MOCK';
}

export const paymentsService = {
  async createPayment(
    payload: CreatePaymentPayload,
  ): Promise<{ payment: Payment; checkoutUrl?: string }> {
    return apiClient.post<any, { payment: Payment; checkoutUrl?: string }>(
      '/payments/create',
      payload,
    );
  },

  async triggerMockWebhook(paymentId: string): Promise<any> {
    return apiClient.post('/payments/webhook', {
      paymentId,
      status: 'PAID',
      provider: 'MOCK',
    });
  },

  async getUserPayments(): Promise<Payment[]> {
    try {
      return await apiClient.get<any, Payment[]>('/payments/my');
    } catch {
      return [];
    }
  },
};
