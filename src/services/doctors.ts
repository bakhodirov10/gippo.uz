import { apiClient } from '@/lib/axios';
import { DoctorProfile, DoctorStatus } from '@/types';

export interface RegisterDoctorPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio: string;
  experienceYears: number;
  education: string;
  licenseNumber: string;
  consultationFee: number;
  specialtyIds: string[];
}

export interface RegisterDoctorResponse {
  message: string;
  doctorProfileId: string;
  status: DoctorStatus;
}

export interface ReviewDoctorPayload {
  status: DoctorStatus;
  reason?: string;
  notes?: string;
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const doctorsService = {
  async registerDoctor(payload: RegisterDoctorPayload): Promise<RegisterDoctorResponse> {
    return apiClient.post<any, RegisterDoctorResponse>('/doctors/register', {
      email: payload.email.trim(),
      password: payload.password,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim() || undefined,
      bio: payload.bio.trim(),
      experienceYears: Number(payload.experienceYears),
      education: payload.education.trim(),
      licenseNumber: payload.licenseNumber.trim(),
      consultationFee: Number(payload.consultationFee),
      specialtyIds: payload.specialtyIds,
    });
  },

  async getPublicDoctors(params?: {
    specialtyId?: string;
    search?: string;
  }): Promise<DoctorProfile[]> {
    return apiClient.get<any, DoctorProfile[]>('/doctors', { params });
  },

  async getDoctorById(id: string): Promise<DoctorProfile> {
    return apiClient.get<any, DoctorProfile>(`/doctors/${id}`);
  },

  async updateOwnProfile(
    payload: Partial<RegisterDoctorPayload>,
  ): Promise<DoctorProfile> {
    return apiClient.patch<any, DoctorProfile>('/doctors/me', payload);
  },

  async getPendingApplications(): Promise<DoctorProfile[]> {
    return apiClient.get<any, DoctorProfile[]>('/doctors/admin/pending');
  },

  async reviewDoctorApplication(
    doctorProfileId: string,
    payload: ReviewDoctorPayload,
  ): Promise<DoctorProfile> {
    return apiClient.post<any, DoctorProfile>(
      `/doctors/admin/${doctorProfileId}/review`,
      payload,
    );
  },
};
