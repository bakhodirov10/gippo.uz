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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const currency_util_1 = require("../../common/utils/currency.util");
const mock_payment_provider_1 = require("./providers/mock-payment.provider");
const client_1 = require("@prisma/client");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const uuid_1 = require("uuid");
let PaymentsService = class PaymentsService {
    constructor(prisma, mockPaymentProvider, auditLogsService, notificationsService) {
        this.prisma = prisma;
        this.mockPaymentProvider = mockPaymentProvider;
        this.auditLogsService = auditLogsService;
        this.notificationsService = notificationsService;
    }
    async createPayment(patientUserId, dto) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: dto.appointmentId },
            include: { doctorProfile: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.patientId !== patientUserId) {
            throw new common_1.ForbiddenException('You do not own this appointment');
        }
        if (appointment.paymentStatus === client_1.AppointmentPaymentStatus.PAID) {
            throw new common_1.BadRequestException('Appointment is already paid');
        }
        const { grossAmount, platformFee, doctorAmount } = currency_util_1.CurrencyUtil.calculateSplit(appointment.price);
        const providerName = dto.providerName || 'MOCK';
        const initResult = await this.mockPaymentProvider.createPayment({
            appointmentId: appointment.id,
            grossAmount: grossAmount.toNumber(),
            currency: 'UZS',
            patientId: patientUserId,
            description: `Medical consultation appointment #${appointment.id.slice(0, 8)}`,
        });
        const payment = await this.prisma.payment.upsert({
            where: { appointmentId: appointment.id },
            create: {
                appointmentId: appointment.id,
                providerPaymentId: initResult.providerPaymentId,
                providerName,
                grossAmount: grossAmount.toFixed(2),
                platformFee: platformFee.toFixed(2),
                doctorAmount: doctorAmount.toFixed(2),
                currency: 'UZS',
                status: client_1.PaymentStatus.PENDING,
            },
            update: {
                providerPaymentId: initResult.providerPaymentId,
                providerName,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        return {
            paymentId: payment.id,
            grossAmount: payment.grossAmount,
            platformFee: payment.platformFee,
            doctorAmount: payment.doctorAmount,
            currency: payment.currency,
            status: payment.status,
            paymentUrl: initResult.paymentUrl,
        };
    }
    async handleWebhook(headers, body) {
        const validation = await this.mockPaymentProvider.verifyWebhook(headers, body);
        if (!validation.isValid) {
            throw new common_1.BadRequestException('Invalid webhook signature or payload');
        }
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: validation.appointmentId },
            include: { payment: true, doctorProfile: true },
        });
        if (!appointment || !appointment.payment) {
            throw new common_1.NotFoundException('Payment or appointment record not found');
        }
        if (appointment.payment.status === client_1.PaymentStatus.PAID) {
            return { status: 'SUCCESS', message: 'Payment already processed' };
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: appointment.payment.id },
                data: {
                    status: client_1.PaymentStatus.PAID,
                    rawWebhookPayload: JSON.parse(JSON.stringify(body)),
                },
            });
            await tx.appointment.update({
                where: { id: appointment.id },
                data: {
                    status: client_1.AppointmentStatus.CONFIRMED,
                    paymentStatus: client_1.AppointmentPaymentStatus.PAID,
                },
            });
            await tx.transaction.create({
                data: {
                    paymentId: appointment.payment.id,
                    transactionRef: `tx_ref_${(0, uuid_1.v4)().slice(0, 12)}`,
                    type: client_1.TransactionType.CHARGE,
                    amount: appointment.payment.grossAmount,
                    currency: 'UZS',
                    status: client_1.TransactionStatus.SUCCESS,
                },
            });
            const ledger = await tx.doctorLedger.findUnique({
                where: { doctorProfileId: appointment.doctorProfileId },
            });
            if (ledger) {
                const newPending = Number(ledger.pendingBalance) + Number(appointment.payment.doctorAmount);
                await tx.doctorLedger.update({
                    where: { id: ledger.id },
                    data: {
                        pendingBalance: newPending,
                    },
                });
                await tx.ledgerEntry.create({
                    data: {
                        ledgerId: ledger.id,
                        paymentId: appointment.payment.id,
                        type: 'HOLD_PENDING',
                        amount: appointment.payment.doctorAmount,
                        balanceAfter: ledger.availableBalance,
                        description: `Pending 95% share credited for Appointment #${appointment.id.slice(0, 8)}`,
                    },
                });
            }
        });
        await this.auditLogsService.log({
            action: 'PAYMENT_SUCCESSFUL_WEBHOOK',
            entity: 'Payment',
            entityId: appointment.payment.id,
            metadata: { amount: validation.amount },
        });
        await this.notificationsService.create({
            userId: appointment.patientId,
            title: 'Payment Successful',
            body: `Your payment of ${appointment.price} UZS was confirmed. Appointment is now CONFIRMED.`,
        });
        return { status: 'SUCCESS', message: 'Payment processed successfully' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_payment_provider_1.MockPaymentProvider,
        audit_logs_service_1.AuditLogsService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map