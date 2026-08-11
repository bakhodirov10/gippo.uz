"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInviteGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AdminInviteGuard = class AdminInviteGuard {
    constructor(configService) {
        this.configService = configService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const adminSecretHeader = request.headers['x-admin-invite-secret'];
        const adminSecretBody = request.body?.adminInviteSecret;
        const expectedSecret = this.configService.get('ADMIN_REGISTRATION_SECRET');
        if (!expectedSecret) {
            throw new common_1.UnauthorizedException('Admin registration is currently disabled on this server');
        }
        const providedSecret = adminSecretHeader || adminSecretBody;
        if (!providedSecret || providedSecret !== expectedSecret) {
            throw new common_1.UnauthorizedException('Invalid or missing Admin Invitation Secret');
        }
        return true;
    }
};
exports.AdminInviteGuard = AdminInviteGuard;
exports.AdminInviteGuard = AdminInviteGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AdminInviteGuard);
//# sourceMappingURL=admin-invite.guard.js.map