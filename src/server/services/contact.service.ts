import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../nest/database/prisma.service';
import type { AuditLogsService } from '../nest/modules/audit-logs/audit-logs.service';
import type { EmailService } from './email.service';

export interface SubmitContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly auditLogs?: AuditLogsService,
  ) {}

  async submitMessage(payload: SubmitContactPayload): Promise<{ success: boolean; message: string }> {
    const { name, email, phone, subject = 'Umumiy murojaat', message } = payload;

    if (!name || name.trim().length < 2) {
      throw new BadRequestException('Ismingizni to\'liq kiriting');
    }
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Yaroqli email manzilini kiriting');
    }
    if (!message || message.trim().length < 5) {
      throw new BadRequestException('Xabar matni kamida 5 ta belgidan iborat bo\'lishi kerak');
    }

    // 1. Send notification email to support / admins
    await this.emailService.sendContactNotification({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // 2. Send automatic confirmation to the user
    await this.emailService.sendContactAutoReply(email.trim(), name.trim());

    // 3. Log audit action
    if (this.auditLogs) {
      await this.auditLogs.log({
        action: 'CONTACT_MESSAGE_SUBMITTED',
        entity: 'Contact',
        metadata: {
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim(),
          subject: subject.trim(),
        },
      });
    }

    return {
      success: true,
      message: 'Murojaatingiz qabul qilindi. Tez orada siz bilan bog\'lanamiz.',
    };
  }
}
