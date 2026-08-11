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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const decimal_js_1 = require("decimal.js");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformAnalytics() {
        const [totalUsers, totalDoctors, pendingDoctors, approvedDoctors, totalAppointments, completedConsultations, aiConversations, payments,] = await Promise.all([
            this.prisma.user.count({ where: { role: client_1.Role.PATIENT } }),
            this.prisma.doctorProfile.count(),
            this.prisma.doctorProfile.count({
                where: { verificationStatus: client_1.DoctorStatus.PENDING },
            }),
            this.prisma.doctorProfile.count({
                where: { verificationStatus: client_1.DoctorStatus.APPROVED },
            }),
            this.prisma.appointment.count(),
            this.prisma.appointment.count({
                where: { status: client_1.AppointmentStatus.COMPLETED },
            }),
            this.prisma.aIConversation.count(),
            this.prisma.payment.findMany({
                where: { status: client_1.PaymentStatus.PAID },
                select: {
                    grossAmount: true,
                    platformFee: true,
                    doctorAmount: true,
                },
            }),
        ]);
        let totalRevenue = new decimal_js_1.default(0);
        let platformRevenue = new decimal_js_1.default(0);
        let doctorEarnings = new decimal_js_1.default(0);
        for (const p of payments) {
            totalRevenue = totalRevenue.add(new decimal_js_1.default(p.grossAmount));
            platformRevenue = platformRevenue.add(new decimal_js_1.default(p.platformFee));
            doctorEarnings = doctorEarnings.add(new decimal_js_1.default(p.doctorAmount));
        }
        return {
            users: {
                totalPatients: totalUsers,
                totalDoctors,
                pendingDoctors,
                approvedDoctors,
            },
            appointments: {
                totalAppointments,
                completedConsultations,
            },
            financials: {
                totalRevenue: totalRevenue.toFixed(2),
                platformRevenue: platformRevenue.toFixed(2),
                doctorEarnings: doctorEarnings.toFixed(2),
                currency: 'UZS',
            },
            aiUsage: {
                totalConversations: aiConversations,
            },
        };
    }
    async getAllUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [total, users] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map