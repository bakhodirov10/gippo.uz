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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const password_util_1 = require("../../common/utils/password.util");
const client_1 = require("@prisma/client");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, auditLogsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditLogsService = auditLogsService;
    }
    async registerPatient(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await password_util_1.PasswordUtil.hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                role: client_1.Role.PATIENT,
            },
        });
        await this.auditLogsService.log({
            actorId: user.id,
            action: 'USER_REGISTER_PATIENT',
            entity: 'User',
            entityId: user.id,
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    async registerAdmin(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await password_util_1.PasswordUtil.hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: client_1.Role.ADMIN,
            },
        });
        await this.auditLogsService.log({
            actorId: user.id,
            action: 'ADMIN_REGISTER_SECURE',
            entity: 'User',
            entityId: user.id,
            metadata: { role: client_1.Role.ADMIN },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                doctorProfile: { select: { id: true, verificationStatus: true } },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isValid = await password_util_1.PasswordUtil.verifyPassword(user.passwordHash, dto.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account has been suspended or deactivated');
        }
        await this.auditLogsService.log({
            actorId: user.id,
            action: 'USER_LOGIN',
            entity: 'User',
            entityId: user.id,
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user: {
                ...this.sanitizeUser(user),
                doctorProfile: user.doctorProfile,
            },
            tokens,
        };
    }
    async refreshToken(dto) {
        const tokenHash = this.hashToken(dto.refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!storedToken ||
            storedToken.isRevoked ||
            new Date() > storedToken.expiresAt) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role);
        return tokens;
    }
    async logout(userId, refreshTokenStr) {
        if (refreshTokenStr) {
            const tokenHash = this.hashToken(refreshTokenStr);
            await this.prisma.refreshToken.updateMany({
                where: { tokenHash, userId },
                data: { isRevoked: true },
            });
        }
        else {
            await this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { isRevoked: true },
            });
        }
        await this.auditLogsService.log({
            actorId: userId,
            action: 'USER_LOGOUT',
            entity: 'User',
            entityId: userId,
        });
        return { message: 'Logged out successfully' };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
        });
        const rawRefreshToken = crypto.randomBytes(40).toString('hex');
        const tokenHash = this.hashToken(rawRefreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken: rawRefreshToken,
        };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_logs_service_1.AuditLogsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map