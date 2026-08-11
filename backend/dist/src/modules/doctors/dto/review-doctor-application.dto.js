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
exports.ReviewDoctorApplicationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ReviewDoctorApplicationDto {
}
exports.ReviewDoctorApplicationDto = ReviewDoctorApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.DoctorStatus,
        example: client_1.DoctorStatus.APPROVED,
        description: 'Status decision: APPROVED, REJECTED, SUSPENDED',
    }),
    (0, class_validator_1.IsEnum)(client_1.DoctorStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReviewDoctorApplicationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'License document valid and verified by ministry of health.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewDoctorApplicationDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Please provide updated medical license scan.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewDoctorApplicationDto.prototype, "notes", void 0);
//# sourceMappingURL=review-doctor-application.dto.js.map