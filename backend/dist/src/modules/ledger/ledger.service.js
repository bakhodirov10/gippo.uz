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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let LedgerService = class LedgerService {
    constructor(prisma, auditLogsService) {
        this.prisma = prisma;
        this.auditLogsService = auditLogsService;
    }
    async getDoctorLedger(doctorUserId) {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        const ledger = await this.prisma.doctorLedger.findUnique({
            where: { doctorProfileId: doctorProfile.id },
            include: {
                ledgerEntries: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!ledger) {
            throw new common_1.NotFoundException('Doctor ledger not found');
        }
        return ledger;
    }
    async requestWithdrawal(doctorUserId, amount) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Withdrawal amount must be positive');
        }
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
            where: { userId: doctorUserId },
        });
        if (!doctorProfile) {
            throw new common_1.NotFoundException('Doctor profile not found');
        }
        const ledger = await this.prisma.doctorLedger.findUnique({
            where: { doctorProfileId: doctorProfile.id },
        });
        if (!ledger) {
            throw new common_1.NotFoundException('Doctor ledger not found');
        }
        const currentAvailable = Number(ledger.availableBalance);
        if (currentAvailable < amount) {
            throw new common_1.BadRequestException(`Insufficient available balance. Available: ${currentAvailable} UZS`);
        }
        return this.prisma.$transaction(async (tx) => {
            const newAvailable = currentAvailable - amount;
            const newWithdrawn = Number(ledger.totalWithdrawn) + amount;
            const updatedLedger = await tx.doctorLedger.update({
                where: { id: ledger.id },
                data: {
                    availableBalance: newAvailable,
                    totalWithdrawn: newWithdrawn,
                },
            });
            await tx.ledgerEntry.create({
                data: {
                    ledgerId: ledger.id,
                    type: 'DEBIT_WITHDRAWAL',
                    amount,
                    balanceAfter: newAvailable,
                    description: `Payout withdrawal request for ${amount} UZS`,
                },
            });
            await this.auditLogsService.log({
                actorId: doctorUserId,
                action: 'DOCTOR_WITHDRAWAL_REQUESTED',
                entity: 'DoctorLedger',
                entityId: ledger.id,
                metadata: { amount },
            });
            return {
                message: 'Withdrawal processed successfully',
                ledger: updatedLedger,
            };
        });
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map