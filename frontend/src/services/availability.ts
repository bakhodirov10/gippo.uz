import { apiClient } from '@/lib/axios';
import { Availability, DoctorLedger } from '@/types';

export interface SetAvailabilitySlot {
  dayOfWeek: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotDurationMinutes?: number;
  isAvailable?: boolean;
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const availabilityService = {
  async getDoctorAvailability(doctorProfileId: string): Promise<Availability[]> {
    return apiClient.get<any, Availability[]>(
      `/availability/doctor/${doctorProfileId}`,
    );
  },

  async setDoctorAvailability(
    slots: SetAvailabilitySlot[],
  ): Promise<Availability[]> {
    return apiClient.put<any, Availability[]>('/availability/me', { availabilities: slots });
  },
};
