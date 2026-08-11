"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ai_service_1 = require("./ai.service");
const prisma_service_1 = require("../../database/prisma.service");
const config_1 = require("@nestjs/config");
describe('AiService', () => {
    let service;
    let prisma;
    const mockPrismaService = {
        aIConversation: {
            create: jest.fn().mockResolvedValue({ id: 'conv-123', userId: 'user-1' }),
            findUnique: jest.fn().mockResolvedValue({ id: 'conv-123', userId: 'user-1' }),
        },
        aIMessage: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'msg-1', ...data })),
        },
    };
    const mockConfigService = {
        get: jest.fn((key) => {
            if (key === 'AI_API_KEY')
                return 'mock-key';
            return null;
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                ai_service_1.AiService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(ai_service_1.AiService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should process unauthenticated normal message and return response with disclaimer', async () => {
        const res = await service.processChat(null, {
            message: 'I have a mild headache',
        });
        expect(res.isEmergency).toBe(false);
        expect(res.reply).toContain('Disclaimer:');
        expect(res.conversationId).toBeNull();
    });
    it('should detect emergency keywords and instruct 103 call', async () => {
        const res = await service.processChat(null, {
            message: 'I have chest pain and shortness of breath',
        });
        expect(res.isEmergency).toBe(true);
        expect(res.reply).toContain('103');
    });
    it('should persist conversation for authenticated user', async () => {
        const res = await service.processChat('user-1', {
            message: 'What is high blood pressure?',
        });
        expect(res.conversationId).toBe('conv-123');
        expect(mockPrismaService.aIMessage.create).toHaveBeenCalled();
    });
});
//# sourceMappingURL=ai.service.spec.js.map