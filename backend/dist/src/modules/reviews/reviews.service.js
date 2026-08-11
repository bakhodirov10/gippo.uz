"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const decimal_js_1 = require("decimal.js");
let ReviewsService = class ReviewsService {
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async createReview(patientUserId, dto) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: dto.appointmentId },
            include: { review: true, doctorProfile: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.patientId !== patientUserId) {
            throw new common_1.ForbiddenException('You can only review your own appointments');
        }
        if (appointment.status !== client_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Reviews are only allowed for COMPLETED appointments');
        }
        if (appointment.review) {
            throw new common_1.ConflictException('A review has already been submitted for this appointment');
        }
        const review = await this.prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    appointmentId: appointment.id,
                    patientId: patientUserId,
                    doctorProfileId: appointment.doctorProfileId,
                    rating: dto.rating,
                    comment: dto.comment,
                },
            });
            const aggregate = await tx.review.aggregate({
                where: { doctorProfileId: appointment.doctorProfileId },
                _avg: { rating: true },
                _count: { rating: true },
            });
            const avgRating = new decimal_js_1.default(aggregate._avg.rating || dto.rating).toDecimalPlaces(2, decimal_js_1.default.ROUND_HALF_UP);
            const totalReviews = aggregate._count.rating || 1;
            await tx.doctorProfile.update({
                where: { id: appointment.doctorProfileId },
                data: {
                    averageRating: avgRating.toFixed(2),
                    totalReviews,
                },
            });
            return newReview;
        });
        await this.auditLogsService.log({
            actorId: patientUserId,
            action: 'DOCTOR_REVIEW_SUBMITTED',
            entity: 'Review',
            entityId: review.id,
            metadata: { rating: dto.rating, doctorProfileId: appointment.doctorProfileId },
        });
        return review;
    }
    async getDoctorReviews(doctorProfileId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [total, reviews] = await Promise.all([
            this.prisma.review.count({ where: { doctorProfileId } }),
            this.prisma.review.findMany({
                where: { doctorProfileId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    patient: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
        ]);
        return {
            reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map