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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let AvailabilityService = class AvailabilityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async setDoctorAvailability(userId, dto) {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { userId },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.availability.deleteMany({
                where: { doctorProfileId: doctorProfile.id },
            });
            const created = await tx.availability.createMany({
                data: dto.availabilities.map((item) => ({
                    doctorProfileId: doctorProfile.id,
                    dayOfWeek: item.dayOfWeek,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    slotDurationMinutes: item.slotDurationMinutes,
                    isAvailable: item.isAvailable ?? true,
                })),
            });
            return {
                message: 'Availability updated successfully',
                count: created.count,
            };
        });
    }
    async getDoctorAvailability(doctorProfileId) {
        const availabilities = await this.prisma.availability.findMany({
            where: { doctorProfileId, isAvailable: true },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
        return availabilities;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map