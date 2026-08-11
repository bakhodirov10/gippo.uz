import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Middlewares
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix `/api/v1`
  app.setGlobalPrefix('api/v1');

  // Input DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Gippo.uz API')
    .setDescription(
      'Production-Ready Health-Tech Marketplace REST API. Supports Patients, Verified Doctors, Admin Panel, 95/5 Ledger Split, Concurrency Booking, and Free AI Assistant.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Patient & Admin Authentication')
    .addTag('Doctors', 'Doctor Profiles & Approval State Machine')
    .addTag('Specialties', 'Medical Specialties Directory')
    .addTag('Availability', 'Doctor Working Schedules')
    .addTag('Appointments', 'Booking Engine with Concurrency Lock')
    .addTag('Payments', 'Abstract Gateway & Webhooks (95/5 Split)')
    .addTag('Doctor Earning Ledger', 'Immutable Earnings & Withdrawals')
    .addTag('Consultations', 'Video Telehealth Room Tokens')
    .addTag('Reviews', 'Verified Doctor Ratings (1 Appointment = 1 Review)')
    .addTag('AI Medical Assistant', 'Backend Secured LLM Proxy & Safety')
    .addTag('Admin Dashboard & Analytics', 'Metrics, Audit Logs & System Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Gippo.uz Backend running on port ${port}`);
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/v1/docs`);
}

bootstrap();
