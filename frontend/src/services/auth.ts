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
  specialtyIds?: string[];
  bio?: string;
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

export const authService = {
  async registerPatient(payload: RegisterPatientPayload): Promise<AuthResponse> {
    const res = await apiClient.post<any, BackendAuthData>('/auth/register', payload);
    return flattenAuthData(res);
  },

  async registerDoctor(payload: RegisterDoctorPayload): Promise<AuthResponse> {
    const res = await apiClient.post<any, BackendAuthData>('/auth/register-doctor', payload);
    return flattenAuthData(res);
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

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: { token: string; newPassword: string }): Promise<void> {
    await apiClient.post('/auth/reset-password', payload);
  },

  async updateProfile(payload: { firstName: string; lastName: string; phone?: string }): Promise<User> {
    const res = await apiClient.put<any, User>('/users/me', payload);
    return res;
  },
};
