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
    const formattedSlots = slots.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      slotDurationMinutes: s.slotDurationMinutes || 30,
      isAvailable: s.isAvailable !== undefined ? s.isAvailable : true,
    }));
    return apiClient.put<any, Availability[]>('/availability/me', { availabilities: formattedSlots });
  },
};
