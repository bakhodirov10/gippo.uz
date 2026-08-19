import { apiClient } from '@/lib/axios';
import { Appointment } from '@/types';

export interface CreateAppointmentPayload {
  doctorProfileId: string;
  startTime: string; // ISO DateTime
  endTime: string; // ISO DateTime
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const appointmentsService = {
  async createAppointment(
    payload: CreateAppointmentPayload,
  ): Promise<Appointment> {
    return apiClient.post<any, Appointment>('/appointments', payload);
  },

  async getUserAppointments(): Promise<Appointment[]> {
    return apiClient.get<any, Appointment[]>('/appointments');
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    return apiClient.get<any, Appointment>(`/appointments/${id}`);
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    return apiClient.post<any, Appointment>(`/appointments/${id}/cancel`);
  },

  async completeAppointment(id: string): Promise<Appointment> {
    return apiClient.post<any, Appointment>(`/appointments/${id}/complete`);
  },
};
