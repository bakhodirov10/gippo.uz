import { apiClient } from '@/lib/axios';
import { Specialty } from '@/types';

export interface CreateSpecialtyPayload {
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.
// So apiClient.get() already returns T — no .data needed.

export const specialtiesService = {
  async getAll(): Promise<Specialty[]> {
    return apiClient.get<any, Specialty[]>('/specialties');
  },

  async getById(id: string): Promise<Specialty> {
    return apiClient.get<any, Specialty>(`/specialties/${id}`);
  },

  async create(payload: CreateSpecialtyPayload): Promise<Specialty> {
    return apiClient.post<any, Specialty>('/specialties', payload);
  },
};
