"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentProvider = void 0;
const common_1 = require("@nestjs/common");
let MockPaymentProvider = class MockPaymentProvider {
    constructor() {
        this.providerName = 'MOCK';
    }
    async createPayment(input) {
        const mockTransactionId = `mock_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const paymentUrl = `https://checkout.gippo.uz/pay/mock/${mockTransactionId}`;
        return {
            providerPaymentId: mockTransactionId,
            paymentUrl,
            status: 'PENDING',
            rawResponse: {
                provider: 'MOCK',
                amount: input.grossAmount,
                currency: input.currency,
                created: new Date().toISOString(),
            },
        };
    }
    async verifyWebhook(headers, body) {
        const isValid = body?.status === 'SUCCESS' || body?.status === 'PAID';
        return {
            isValid: true,
            appointmentId: body.appointmentId,
            providerPaymentId: body.providerPaymentId || `mock_tx_${Date.now()}`,
            amount: Number(body.amount),
            status: isValid ? 'PAID' : 'FAILED',
            rawPayload: body,
        };
    }
};
exports.MockPaymentProvider = MockPaymentProvider;
exports.MockPaymentProvider = MockPaymentProvider = __decorate([
    (0, common_1.Injectable)()
], MockPaymentProvider);
//# sourceMappingURL=mock-payment.provider.js.map