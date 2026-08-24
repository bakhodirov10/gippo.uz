import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from './nest/database/prisma.service';
import { AdminService } from './nest/modules/admin/admin.service';
import { AiService } from './nest/modules/ai/ai.service';
import { AppointmentsService } from './nest/modules/appointments/appointments.service';
import { AuditLogsService } from './nest/modules/audit-logs/audit-logs.service';
import { AuthService } from './nest/modules/auth/auth.service';
import { AvailabilityService } from './nest/modules/availability/availability.service';
import { MockVideoProvider } from './nest/modules/consultations/providers/mock-video.provider';
import { ConsultationsService } from './nest/modules/consultations/consultations.service';
import { DoctorsService } from './nest/modules/doctors/doctors.service';
import { LedgerService } from './nest/modules/ledger/ledger.service';
import { NotificationsService } from './nest/modules/notifications/notifications.service';
import { MockPaymentProvider } from './nest/modules/payments/providers/mock-payment.provider';
import { PaymentsService } from './nest/modules/payments/payments.service';
import { ReviewsService } from './nest/modules/reviews/reviews.service';
import { SpecialtiesService } from './nest/modules/specialties/specialties.service';

import { EmailService } from './services/email.service';
import { OtpService } from './services/otp.service';
import { ContactService } from './services/contact.service';

export type ServerContainer = ReturnType<typeof createContainer>;

function createContainer() {
  const prisma = new PrismaService();
  const config = new ConfigService(process.env);
  const auditLogs = new AuditLogsService(prisma);
  const notifications = new NotificationsService(prisma);
  const jwt = new JwtService();
  const ai = new AiService(prisma, config);
  ai.onModuleInit();

  const email = new EmailService();
  const otp = new OtpService(prisma, email, auditLogs);
  const contact = new ContactService(prisma, email, auditLogs);

  return {
    prisma,
    jwt,
    auth: new AuthService(prisma, jwt, config, auditLogs),
    doctors: new DoctorsService(prisma, auditLogs, notifications),
    appointments: new AppointmentsService(prisma, auditLogs, notifications),
    availability: new AvailabilityService(prisma),
    specialties: new SpecialtiesService(prisma),
    reviews: new ReviewsService(prisma, auditLogs),
    payments: new PaymentsService(prisma, new MockPaymentProvider(), auditLogs, notifications),
    ledger: new LedgerService(prisma, auditLogs),
    consultations: new ConsultationsService(prisma, new MockVideoProvider()),
    admin: new AdminService(prisma),
    auditLogs,
    ai,
    email,
    otp,
    contact,
  };
}

const globalForServer = globalThis as typeof globalThis & {
  gippoServer?: ServerContainer;
};

export const server = globalForServer.gippoServer ?? createContainer();

if (process.env.NODE_ENV !== 'production') {
  globalForServer.gippoServer = server;
}
