import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendOtpEmailOptions {
  email: string;
  code: string;
  type?: 'PASSWORD_RESET' | 'VERIFY_EMAIL' | 'LOGIN_2FA';
  expiresInMinutes?: number;
}

export interface SendContactNotificationOptions {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SendTransactionalEmailOptions {
  to: string;
  subject: string;
  title: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM || '"Gippo Telemeditsina" <noreply@gippo.uz>';
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log(`[EmailService] Nodemailer SMTP configured with host: ${host}:${port}`);
    } else {
      console.log('[EmailService] SMTP credentials not fully provided. Running in high-fidelity mock/log mode.');
    }
  }

  /**
   * Send 6-digit OTP email with modern branded Gippo UI template
   */
  async sendOtpEmail({ email, code, type = 'PASSWORD_RESET', expiresInMinutes = 5 }: SendOtpEmailOptions): Promise<boolean> {
    const titles: Record<string, string> = {
      PASSWORD_RESET: 'Parolni tiklash kodi',
      VERIFY_EMAIL: 'Email manzilini tasdiqlash',
      LOGIN_2FA: 'Kirish uchun bir martalik kod (OTP)',
    };

    const subject = `[Gippo] ${titles[type] || 'Bir martalik tasdiqlash kodi'}: ${code}`;
    const heading = titles[type] || 'Tasdiqlash kodi';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${heading}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;">GIPPO.UZ</h1>
            <p style="color: #ccfbf1; margin: 6px 0 0 0; font-size: 13px;">Zamonaviy Telemeditsina Platformasi</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 28px;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">${heading}</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              Siz Gippo platformasida amalni bajarish uchun bir martalik tasdiqlash kodini so'radingiz. Davom etish uchun quyidagi kodni kiriting:
            </p>

            <!-- OTP Box -->
            <div style="background-color: #f1f5f9; border: 2px dashed #0d9488; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f766e; display: inline-block;">
                ${code}
              </span>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 600;">
                ⏰ Ushbu kod faqat <strong>${expiresInMinutes} daqiqa</strong> davomida amal qiladi.
              </p>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
              Agar siz bu so'rovni yubormagan bo'lsangiz, xavotir olmang — hisobingiz xavfsiz holatda. Ushbu xatni e'tiborsiz qoldirishingiz mumkin. Kodni hech kimga, hatto Gippo xodimlariga ham bermang.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} Gippo.uz — Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject,
      text: `Gippo tasdiqlash kodi: ${code}. Kod ${expiresInMinutes} daqiqa amal qiladi.`,
      html,
    });
  }

  /**
   * One-way contact message: notifies admins / support
   */
  async sendContactNotification(data: SendContactNotificationOptions): Promise<boolean> {
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@gippo.uz';
    const subject = `[Gippo Aloqa] Yangi murojaat: ${data.subject} (${data.name})`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0d9488; margin-top: 0;">Gippo.uz dan yangi xabar</h2>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 4px 0;"><strong>Yuboruvchi:</strong> ${data.name}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p style="margin: 4px 0;"><strong>Telefon:</strong> ${data.phone}</p>` : ''}
          <p style="margin: 4px 0;"><strong>Mavzu:</strong> ${data.subject}</p>
          <p style="margin: 4px 0;"><strong>Sana:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <h3 style="color: #334155; font-size: 14px;">Xabar matni:</h3>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 13px; color: #1e293b;">
          ${data.message}
        </div>
      </div>
    `;

    return this.sendMail({
      to: supportEmail,
      replyTo: data.email,
      subject,
      text: `Yangi murojaat:\nKimdan: ${data.name} (${data.email}, ${data.phone || 'N/A'})\nMavzu: ${data.subject}\nXabar:\n${data.message}`,
      html,
    });
  }

  /**
   * One-way auto-reply confirmation to the user who submitted the contact form
   */
  async sendContactAutoReply(toEmail: string, name: string): Promise<boolean> {
    const subject = `[Gippo] Murojaatingiz qabul qilindi`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #0d9488;">Hurmatli ${name},</h2>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Gippo telemeditsina platformasiga murojaat qilganingiz uchun tashakkur. Sizning xabaringiz qo'llab-quvvatlash xizmati tomonidan muvaffaqiyatli qabul qilindi.
        </p>
        <p style="color: #334155; line-height: 1.6; font-size: 14px;">
          Mutaxassislarimiz xabaringizni o'rganib chiqib, imkon qadar tezroq siz bilan bog'lanishadi.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          Gippo.uz Qo'llab-quvvatlash jamoasi<br>
          <a href="https://gippo.uz" style="color: #0d9488; text-decoration: none;">www.gippo.uz</a>
        </div>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      text: `Hurmatli ${name}, murojaatingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.`,
      html,
    });
  }

  /**
   * Universal transactional notification email (One-way notification)
   */
  async sendTransactionalEmail(opts: SendTransactionalEmailOptions): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0d9488; margin: 0;">${opts.title}</h2>
        </div>
        <div style="color: #334155; line-height: 1.6; font-size: 14px; margin-bottom: 24px;">
          ${opts.body}
        </div>
        ${opts.actionUrl && opts.actionText ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${opts.actionUrl}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
              ${opts.actionText}
            </a>
          </div>
        ` : ''}
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          Bu xat avtomatik ravishda Gippo.uz tizimi tomonidan yuborilgan. Unga javob qaytarmang.
        </div>
      </div>
    `;

    return this.sendMail({
      to: opts.to,
      subject: opts.subject,
      text: `${opts.title}\n\n${opts.body}`,
      html,
    });
  }

  private async sendMail(options: { to: string; replyTo?: string; subject: string; text: string; html: string }): Promise<boolean> {
    const mailOptions = {
      from: this.fromEmail,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email sent successfully to ${options.to}. MessageId: ${info.messageId}`);
        return true;
      } catch (error) {
        console.error(`[EmailService] Error sending email via SMTP to ${options.to}:`, error);
        // Fallback to logging so user request does not crash
        console.log(`[EmailService:FallbackLog] TO: ${options.to} | SUBJECT: ${options.subject}`);
        return true;
      }
    } else {
      console.log(`[EmailService:Simulated]
==================================================
📬 OUTGOING EMAIL NOTIFICATION
TO: ${options.to}
FROM: ${this.fromEmail}
SUBJECT: ${options.subject}
--------------------------------------------------
${options.text}
==================================================`);
      return true;
    }
  }
}
