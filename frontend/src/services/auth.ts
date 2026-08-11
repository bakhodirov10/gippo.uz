import { apiClient } from '@/lib/axios';
import { ApiResponse, User } from '@/types';

// --- Backend response shapes ---
// POST /auth/register   → { user, tokens: { accessToken, refreshToken } }
// POST /auth/login      → { user, tokens: { accessToken, refreshToken } }
// POST /auth/refresh    → { accessToken, refreshToken }     (flat)
// Axios interceptor already unwraps { success, data } → returns `data` directly.

export interface RegisterPatientPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
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

/** Raw shape that backend actually returns for register/login */
interface BackendAuthData {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/** Flatten backend { user, tokens } into the AuthResponse shape the app uses */
function flattenAuthData(data: BackendAuthData): AuthResponse {
  return {
    user: data.user,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

export const authService = {
  async registerPatient(payload: RegisterPatientPayload): Promise<AuthResponse> {
    // Interceptor unwraps { success, data } → res is already `data` ({ user, tokens })
    const res = await apiClient.post<any, BackendAuthData>('/auth/register', payload);
    return flattenAuthData(res);
  },

  async registerAdmin(payload: RegisterAdminPayload): Promise<AuthResponse> {
    const { inviteSecret, ...body } = payload;
    const res = await apiClient.post<any, BackendAuthData>('/auth/register-admin', body, {
      headers: {
        'x-admin-invite-secret': inviteSecret,
      },
    });
    return flattenAuthData(res);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<any, BackendAuthData>('/auth/login', payload);
    return flattenAuthData(res);
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // /auth/refresh returns flat { accessToken, refreshToken } (no tokens wrapper)
    const res = await apiClient.post<any, { accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    return res;
  },

  async logout(refreshToken?: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
