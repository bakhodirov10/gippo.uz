import crypto from 'crypto';
import * as argon2 from 'argon2';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../nest/database/prisma.service';
import type { AuditLogsService } from '../nest/modules/audit-logs/audit-logs.service';
import type { EmailService } from './email.service';

interface OtpRecord {
  code: string;
  type: string;
  expiresAt: number; // timestamp in ms
  attempts: number;
}

export class OtpService {
  // In-memory OTP storage keyed by `${type}:${email}`
  private otpStore = new Map<string, OtpRecord>();
  // Rate-limiting map keyed by email -> timestamp of last request
  private rateLimits = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly auditLogs?: AuditLogsService,
  ) {
    // Periodically clean up expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000).unref();
  }

  private generateCode(): string {
    // Generate secure 6-digit numerical code
    return crypto.randomInt(100000, 999999).toString();
  }

  private getStoreKey(email: string, type: string): string {
    return `${type.toUpperCase()}:${email.toLowerCase().trim()}`;
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [key, record] of this.otpStore.entries()) {
      if (record.expiresAt < now) {
        this.otpStore.delete(key);
      }
    }
  }

  /**
   * Request and send OTP code to email
   */
  async sendOtp(email: string, type: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'LOGIN_2FA' = 'PASSWORD_RESET'): Promise<{ success: boolean; message: string; expiresInSeconds: number }> {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new BadRequestException('Yaroqli email manzilini kiriting');
    }

    // Rate limit: max 1 request every 30 seconds
    const lastRequest = this.rateLimits.get(normalizedEmail);
    const now = Date.now();
    if (lastRequest && now - lastRequest < 30 * 1000) {
      const waitSeconds = Math.ceil((30 * 1000 - (now - lastRequest)) / 1000);
      throw new BadRequestException(`Iltimos, yangi kod so'rashdan oldin ${waitSeconds} soniya kuting.`);
    }

    const code = this.generateCode();
    const expiresInMinutes = 5;
    const expiresAt = now + expiresInMinutes * 60 * 1000;

    const key = this.getStoreKey(normalizedEmail, type);
    this.otpStore.set(key, {
      code,
      type,
      expiresAt,
      attempts: 0,
    });
    this.rateLimits.set(normalizedEmail, now);

    // Dispatch via Nodemailer email service
    await this.emailService.sendOtpEmail({
      email: normalizedEmail,
      code,
      type,
      expiresInMinutes,
    });

    return {
      success: true,
      message: `${normalizedEmail} manziliga 6 xonali tasdiqlash kodi yuborildi`,
      expiresInSeconds: expiresInMinutes * 60,
    };
  }

  /**
   * Verify an OTP code
   */
  async verifyOtp(email: string, code: string, type: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'LOGIN_2FA' = 'PASSWORD_RESET'): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();
    const key = this.getStoreKey(normalizedEmail, type);

    const record = this.otpStore.get(key);
    if (!record) {
      throw new BadRequestException('Tasdiqlash kodi topilmadi yoki muddati tugagan. Qaytadan kod so\'rang.');
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('Tasdiqlash kodining amal qilish muddati tugagan. Yangi kod so\'rang.');
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpStore.delete(key);
      throw new BadRequestException('Urinishlar soni chegarasidan oshdi. Iltimos, yangi kod so\'rang.');
    }

    if (record.code !== normalizedCode) {
      throw new BadRequestException('Noto\'g\'ri tasdiqlash kodi kiritildi');
    }

    // Code verified successfully
    return true;
  }

  /**
   * Forgot password flow: generates and sends OTP
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't leak user existence; return generic message
      return {
        success: true,
        message: 'Agar ushbu email ro\'yxatdan o\'tgan bo\'lsa, parolni tiklash kodi yuborildi.',
      };
    }

    await this.sendOtp(normalizedEmail, 'PASSWORD_RESET');
    return {
      success: true,
      message: 'Parolni tiklash kodi email manzilingizga yuborildi.',
    };
  }

  /**
   * Reset password flow with verified OTP code
   */
  async resetPassword(payload: { email: string; code: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const { email, code, newPassword } = payload;
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Parol kamida 8 ta belgidan iborat bo\'lishi shart');
    }

    const normalizedEmail = email.toLowerCase().trim();
    await this.verifyOtp(normalizedEmail, code, 'PASSWORD_RESET');

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate OTP after successful reset
    const key = this.getStoreKey(normalizedEmail, 'PASSWORD_RESET');
    this.otpStore.delete(key);

    // Invalidate existing refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    // Send confirmation email (one-way notification)
    await this.emailService.sendTransactionalEmail({
      to: normalizedEmail,
      subject: '[Gippo] Parolingiz muvaffaqiyatli o\'zgartirildi',
      title: 'Xavfsizlik bildirishnomasi',
      body: 'Sizning Gippo hisobingiz paroli muvaffaqiyatli yangilandi. Agar bu amalni siz bajarmagan bo\'lsangiz, zudlik bilan qo\'llab-quvvatlash xizmatiga murojaat qiling.',
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://gippo.uz'}/login`,
      actionText: 'Tizimga kirish',
    });

    if (this.auditLogs) {
      await this.auditLogs.log({
        actorId: user.id,
        action: 'PASSWORD_RESET_SUCCESS',
        entity: 'User',
        entityId: user.id,
        metadata: { email: normalizedEmail },
      });
    }

    return {
      success: true,
      message: 'Parol muvaffaqiyatli yangilandi. Endi yangi parol bilan tizimga kirishingiz mumkin.',
    };
  }
}
