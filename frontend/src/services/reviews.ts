import { apiClient } from '@/lib/axios';
import { Review } from '@/types';

export interface CreateReviewPayload {
  appointmentId: string;
  rating: number; // 1 to 5
  comment: string;
}

// NOTE: Axios interceptor unwraps { success, data: T } → returns T directly.

export const reviewsService = {
  async createReview(payload: CreateReviewPayload): Promise<Review> {
    return apiClient.post<any, Review>('/reviews', payload);
  },

  async getDoctorReviews(
    doctorProfileId: string,
    page = 1,
    limit = 10,
  ): Promise<{ reviews: Review[]; total: number }> {
    return apiClient.get<any, { reviews: Review[]; total: number }>(
      `/reviews/doctor/${doctorProfileId}`,
      { params: { page, limit } },
    );
  },
};
