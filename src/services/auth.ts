import { apiClient } from '@/lib/axios';
import { ApiResponse, User } from '@/types';

export interface RegisterPatientPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterDoctorPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  licenseNumber: string;
  experienceYears: number;
  consultationFee: number;
  specialtyIds: string[];
  bio: string;
  education: string;
}

export interface RegisterAdminPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  inviteSecret: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface BackendAuthData {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

function flattenAuthData(data: BackendAuthData): AuthResponse {
  return {
    user: data.user,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

export interface RegisterDoctorResponse {
  message: string;
  doctorProfileId: string;
  status: string;
}

export const authService = {
  async registerPatient(payload: RegisterPatientPayload): Promise<AuthResponse> {
    const res = await apiClient.post<any, BackendAuthData>('/auth/register', payload);
    return flattenAuthData(res);
  },

  async registerDoctor(payload: RegisterDoctorPayload): Promise<RegisterDoctorResponse> {
    // Backend endpoint for doctor registration is POST /doctors/register
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

  async registerAdmin(payload: RegisterAdminPayload): Promise<AuthResponse> {
    const { inviteSecret, ...body } = payload;
    const res = await apiClient.post<any, BackendAuthData>(
      '/auth/register-admin',
      {
        ...body,
        adminInviteSecret: inviteSecret,
      },
      {
        headers: {
          'x-admin-invite-secret': inviteSecret,
        },
      },
    );
    return flattenAuthData(res);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<any, BackendAuthData>('/auth/login', payload);
    return flattenAuthData(res);
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await apiClient.post<any, { accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    return res;
  },

  async logout(refreshToken?: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async sendOtp(email: string, type: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'LOGIN_2FA' = 'PASSWORD_RESET'): Promise<{ message: string; expiresInSeconds: number }> {
    const res = await apiClient.post<any, { message: string; expiresInSeconds: number }>('/auth/otp/send', { email, type });
    return res;
  },

  async verifyOtp(email: string, code: string, type: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'LOGIN_2FA' = 'PASSWORD_RESET'): Promise<boolean> {
    const res = await apiClient.post<any, boolean>('/auth/otp/verify', { email, code, type });
    return res;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<any, { message: string }>('/auth/forgot-password', { email });
    return res;
  },

  async resetPassword(payload: { email: string; code: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.post<any, { message: string }>('/auth/reset-password', payload);
    return res;
  },

  async updateProfile(payload: { firstName: string; lastName: string; phone?: string }): Promise<User> {
    const res = await apiClient.patch<any, User>('/doctors/me', payload);
    return res;
  },
};
