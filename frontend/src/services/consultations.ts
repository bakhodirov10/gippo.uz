import { apiClient } from '@/lib/axios';

export interface VideoSessionTokenResponse {
  roomName: string;
  token: string;
  provider: 'JITSI' | 'AGORA' | 'DAILY';
  serverUrl?: string;
  accessCode: string;
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const consultationsService = {
  async getSessionToken(
    appointmentId: string,
  ): Promise<VideoSessionTokenResponse> {
    return apiClient.get<any, VideoSessionTokenResponse>(
      `/consultations/appointment/${appointmentId}/token`,
    );
  },
};
