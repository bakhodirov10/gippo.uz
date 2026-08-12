import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Middlewares - configure helmet to allow cross-origin requests & swagger assets
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
    }),
  );

  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000',
    'http://192.168.100.72:3001',
    'http://192.168.100.72:3000',
  ];

  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    process.env.CORS_ORIGIN.split(',').forEach((origin) => {
      const trimmed = origin.trim();
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  const isAllowedOrigin = (origin?: string): boolean => {
    if (!origin) return true; // Allow non-browser calls (Postman, curl, server-to-server)
    if (allowedOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV !== 'production') {
      // Allow local network IP addresses (10.x.x.x, 192.168.x.x, 172.16-31.x.x, localhost, 127.0.0.1) in development
      if (
        /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
          origin,
        )
      ) {
        return true;
      }
    }
    return false;
  };

  app.enableCors({
    origin: (requestOrigin, callback) => {
      const allowed = isAllowedOrigin(requestOrigin);
      const originDisplay = requestOrigin || 'No Origin';
      logger.log(`[CORS] Origin: ${originDisplay} -> ${allowed ? 'ALLOWED' : 'BLOCKED'}`);

      if (allowed) {
        callback(null, requestOrigin || true);
      } else {
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'x-admin-invite-secret',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Gippo.uz Backend running on port ${port}`);
  logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/v1/docs`);
}

bootstrap();
