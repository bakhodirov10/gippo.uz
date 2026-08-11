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
exports.ConsultationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const mock_video_provider_1 = require("./providers/mock-video.provider");
const client_1 = require("@prisma/client");
let ConsultationsService = class ConsultationsService {
    constructor(prisma, videoProvider) {
        this.prisma = prisma;
        this.videoProvider = videoProvider;
    }
    async getSessionToken(appointmentId, userId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                consultation: true,
                patient: true,
                doctorProfile: { include: { user: true } },
            },
        });
        if (!appointment || !appointment.consultation) {
            throw new common_1.NotFoundException('Appointment or consultation session not found');
        }
        const isPatient = appointment.patientId === userId;
        const isDoctor = appointment.doctorProfile.user.id === userId;
        if (!isPatient && !isDoctor) {
            throw new common_1.ForbiddenException('Only appointment patient or doctor can access video consultation');
        }
        const userName = isDoctor
            ? `Dr. ${appointment.doctorProfile.user.firstName} ${appointment.doctorProfile.user.lastName}`
            : `${appointment.patient.firstName} ${appointment.patient.lastName}`;
        const token = await this.videoProvider.generateToken({
            roomName: appointment.consultation.roomName,
            userId,
            userName,
            isDoctor,
        });
        if (appointment.consultation.status === client_1.ConsultationStatus.SCHEDULED) {
            await this.prisma.consultation.update({
                where: { id: appointment.consultation.id },
                data: {
                    status: client_1.ConsultationStatus.IN_PROGRESS,
                    startedAt: new Date(),
                },
            });
        }
        return {
            consultationId: appointment.consultation.id,
            roomName: appointment.consultation.roomName,
            token,
            isDoctor,
            status: appointment.consultation.status,
        };
    }
};
exports.ConsultationsService = ConsultationsService;
exports.ConsultationsService = ConsultationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_video_provider_1.MockVideoProvider])
], ConsultationsService);
//# sourceMappingURL=consultations.service.js.map