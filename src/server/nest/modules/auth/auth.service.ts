import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Role } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async registerPatient(dto: RegisterPatientDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    if (dto.phone && dto.phone.trim()) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: dto.phone.trim() },
      });

      if (existingPhone) {
        throw new ConflictException("Bu telefon raqami allaqachon ro'yxatdan o'tgan");
      }
    }

    const passwordHash = await PasswordUtil.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.PATIENT,
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

  async registerAdmin(dto: RegisterAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await PasswordUtil.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.ADMIN,
      },
    });

    await this.auditLogsService.log({
      actorId: user.id,
      action: 'ADMIN_REGISTER_SECURE',
      entity: 'User',
      entityId: user.id,
      metadata: { role: Role.ADMIN },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        doctorProfile: { select: { id: true, verificationStatus: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await PasswordUtil.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been suspended or deactivated');
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

  async refreshToken(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.isRevoked ||
      new Date() > storedToken.expiresAt
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke used refresh token for Token Rotation
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    return tokens;
  }

  async logout(userId: string, refreshTokenStr?: string) {
    if (refreshTokenStr) {
      const tokenHash = this.hashToken(refreshTokenStr);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, userId },
        data: { isRevoked: true },
      });
    } else {
      // Revoke all tokens for user
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

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
