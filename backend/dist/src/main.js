"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Gippo.uz API')
        .setDescription('Production-Ready Health-Tech Marketplace REST API. Supports Patients, Verified Doctors, Admin Panel, 95/5 Ledger Split, Concurrency Booking, and Free AI Assistant.')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/v1/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Gippo.uz Backend running on port ${port}`);
    logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/v1/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map