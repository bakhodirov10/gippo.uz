import { apiClient } from '@/lib/axios';
import { Payment } from '@/types';
import { appointmentsService } from './appointments';

export interface CreatePaymentPayload {
  appointmentId: string;
  providerName?: 'CLICK' | 'PAYME' | 'MOCK';
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
    // Backend NestJS does not expose GET /payments/my.
    // Instead, payment records are attached to user appointments (GET /appointments).
    const appointments = await appointmentsService.getUserAppointments();
    const payments: Payment[] = [];
    for (const app of appointments) {
      if (app.payment) {
        payments.push(app.payment);
      }
    }
    return payments;
  },
};
