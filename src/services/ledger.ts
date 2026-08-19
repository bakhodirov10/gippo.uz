import { apiClient } from '@/lib/axios';
import { DoctorLedger } from '@/types';

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const ledgerService = {
  async getDoctorLedger(): Promise<DoctorLedger> {
    return apiClient.get<any, DoctorLedger>('/ledger/me');
  },

  async requestWithdrawal(amount: number): Promise<DoctorLedger> {
    return apiClient.post<any, DoctorLedger>('/ledger/withdraw', { amount });
  },
};
