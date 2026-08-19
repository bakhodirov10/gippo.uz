import { apiClient } from '@/lib/axios';
import { AdminAnalytics, AuditLog, User } from '@/types';

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const adminService = {
  async getAnalytics(): Promise<AdminAnalytics> {
    return apiClient.get<any, AdminAnalytics>('/admin/analytics');
  },

  async getAllUsers(
    page = 1,
    limit = 20,
  ): Promise<{ users: User[]; total: number }> {
    return apiClient.get<any, { users: User[]; total: number }>('/admin/users', {
      params: { page, limit },
    });
  },

  async getAuditLogs(
    page = 1,
    limit = 20,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    return apiClient.get<any, { logs: AuditLog[]; total: number }>(
      '/admin/audit-logs',
      { params: { page, limit } },
    );
  },
};
