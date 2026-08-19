import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './database/prisma.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AiModule } from './modules/ai/ai.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { AdminModule } from './modules/admin/admin.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // Max 100 requests per minute per IP
      },
    ]),
    PrismaModule,
    AuditLogsModule,
    NotificationsModule,
    AuthModule,
    SpecialtiesModule,
    DoctorsModule,
    AvailabilityModule,
    AppointmentsModule,
    PaymentsModule,
    LedgerModule,
    ReviewsModule,
    AiModule,
    ConsultationsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
