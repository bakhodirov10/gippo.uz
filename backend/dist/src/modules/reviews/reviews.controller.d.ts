import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(patientUserId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        doctorProfileId: string;
        appointmentId: string;
        patientId: string;
        rating: number;
        comment: string;
    }>;
    getDoctorReviews(doctorProfileId: string, page?: number, limit?: number): Promise<{
        reviews: ({
            patient: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            doctorProfileId: string;
            appointmentId: string;
            patientId: string;
            rating: number;
            comment: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
