"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const prisma_service_1 = require("../../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const common_1 = require("@nestjs/common");
describe('AuthService', () => {
    let service;
    let prisma;
    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
        },
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock_access_token'),
    };
    const mockConfigService = {
        get: jest.fn((key) => {
            if (key === 'JWT_SECRET')
                return 'mock_secret';
            if (key === 'JWT_EXPIRATION')
                return '15m';
            return null;
        }),
    };
    const mockAuditLogsService = {
        log: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
                { provide: audit_logs_service_1.AuditLogsService, useValue: mockAuditLogsService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should throw ConflictException if registering existing email', async () => {
        mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@gippo.uz' });
        await expect(service.registerPatient({
            email: 'test@gippo.uz',
            password: 'Password123!',
            firstName: 'Ali',
            lastName: 'Valiyev',
        })).rejects.toThrow(common_1.ConflictException);
    });
});
//# sourceMappingURL=auth.service.spec.js.map