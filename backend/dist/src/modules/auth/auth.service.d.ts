import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly auditLogsService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, auditLogsService: AuditLogsService);
    registerPatient(dto: RegisterPatientDto): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    registerAdmin(dto: RegisterAdminDto): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshTokenStr?: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private hashToken;
    private sanitizeUser;
}
