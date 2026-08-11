import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class ReviewsService {
    private readonly prisma;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, auditLogsService: AuditLogsService);
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
