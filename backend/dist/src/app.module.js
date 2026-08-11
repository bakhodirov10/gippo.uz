"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./database/prisma.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const auth_module_1 = require("./modules/auth/auth.module");
const specialties_module_1 = require("./modules/specialties/specialties.module");
const doctors_module_1 = require("./modules/doctors/doctors.module");
const availability_module_1 = require("./modules/availability/availability.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const payments_module_1 = require("./modules/payments/payments.module");
const ledger_module_1 = require("./modules/ledger/ledger.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const ai_module_1 = require("./modules/ai/ai.module");
const consultations_module_1 = require("./modules/consultations/consultations.module");
const admin_module_1 = require("./modules/admin/admin.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            audit_logs_module_1.AuditLogsModule,
            notifications_module_1.NotificationsModule,
            auth_module_1.AuthModule,
            specialties_module_1.SpecialtiesModule,
            doctors_module_1.DoctorsModule,
            availability_module_1.AvailabilityModule,
            appointments_module_1.AppointmentsModule,
            payments_module_1.PaymentsModule,
            ledger_module_1.LedgerModule,
            reviews_module_1.ReviewsModule,
            ai_module_1.AiModule,
            consultations_module_1.ConsultationsModule,
            admin_module_1.AdminModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map