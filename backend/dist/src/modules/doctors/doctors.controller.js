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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const doctors_service_1 = require("./doctors.service");
const register_doctor_dto_1 = require("./dto/register-doctor.dto");
const update_doctor_profile_dto_1 = require("./dto/update-doctor-profile.dto");
const review_doctor_application_dto_1 = require("./dto/review-doctor-application.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DoctorsController = class DoctorsController {
    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }
    async registerDoctor(dto) {
        return this.doctorsService.registerDoctor(dto);
    }
    async findPublicDoctors(specialtyId, search) {
        return this.doctorsService.findPublicDoctors(specialtyId, search);
    }
    async findPublicDoctorById(id) {
        return this.doctorsService.findPublicDoctorById(id);
    }
    async updateOwnProfile(userId, dto) {
        return this.doctorsService.updateOwnProfile(userId, dto);
    }
    async findPendingApplications() {
        return this.doctorsService.findPendingApplications();
    }
    async reviewDoctorApplication(adminUserId, doctorProfileId, dto) {
        return this.doctorsService.reviewDoctorApplication(adminUserId, doctorProfileId, dto);
    }
};
exports.DoctorsController = DoctorsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit doctor registration application (status=PENDING)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Application submitted for admin verification' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or license number already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_doctor_dto_1.RegisterDoctorDto]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "registerDoctor", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get public directory of verified/APPROVED doctors' }),
    (0, swagger_1.ApiQuery)({ name: 'specialtyId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)('specialtyId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "findPublicDoctors", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public profile of an APPROVED doctor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approved doctor details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Doctor not found or not approved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "findPublicDoctorById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.DOCTOR),
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Doctor updates own profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_doctor_profile_dto_1.UpdateDoctorProfileDto]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "updateOwnProfile", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('admin/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin list all PENDING doctor applications' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "findPendingApplications", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('admin/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin approve, reject, or suspend doctor profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Doctor status updated and audit logged' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, review_doctor_application_dto_1.ReviewDoctorApplicationDto]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "reviewDoctorApplication", null);
exports.DoctorsController = DoctorsController = __decorate([
    (0, swagger_1.ApiTags)('Doctors'),
    (0, common_1.Controller)('doctors'),
    __metadata("design:paramtypes", [doctors_service_1.DoctorsService])
], DoctorsController);
//# sourceMappingURL=doctors.controller.js.map