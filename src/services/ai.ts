import { apiClient } from '@/lib/axios';
import { AIConversation } from '@/types';

export interface ChatMessagePayload {
  conversationId?: string;
  message: string;
  thinkingEffort?: 'low' | 'medium' | 'high';
  aiModel?: string;
  searchGrounding?: boolean;
}

export interface ChatResponse {
  conversationId: string | null;
  messageId: string | null;
  reply: string;
  disclaimer?: string;
  isEmergency: boolean;
  emergencyNotice?: string;
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const aiService = {
  async sendMessage(payload: ChatMessagePayload): Promise<ChatResponse> {
    // Omit conversationId if empty/blank (backend UUID validator rejects empty strings)
    const cleanPayload: ChatMessagePayload = { message: payload.message };
    if (payload.conversationId?.trim()) {
      cleanPayload.conversationId = payload.conversationId.trim();
    }
    if (payload.thinkingEffort) {
      cleanPayload.thinkingEffort = payload.thinkingEffort;
    }
    if (payload.aiModel) {
      cleanPayload.aiModel = payload.aiModel;
    }
    if (payload.searchGrounding !== undefined) {
      cleanPayload.searchGrounding = payload.searchGrounding;
    }
    return apiClient.post<any, ChatResponse>('/ai/chat', cleanPayload);
  },

  async getUserConversations(): Promise<AIConversation[]> {
    return apiClient.get<any, AIConversation[]>('/ai/conversations');
  },

  async getConversationById(id: string): Promise<AIConversation> {
    return apiClient.get<any, AIConversation>(`/ai/conversations/${id}`);
  },
};
