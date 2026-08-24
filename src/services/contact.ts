import { apiClient } from '@/lib/axios';

export interface SubmitContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const contactService = {
  async submitMessage(payload: SubmitContactPayload): Promise<{ message: string }> {
    const res = await apiClient.post<any, { message: string }>('/contact', payload);
    return res;
  },
};
