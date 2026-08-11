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
exports.SetAvailabilityDto = exports.AvailabilityItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AvailabilityItemDto {
}
exports.AvailabilityItemDto = AvailabilityItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], AvailabilityItemDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00', description: 'Start time HH:mm' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AvailabilityItemDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '17:00', description: 'End time HH:mm' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AvailabilityItemDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30, description: 'Slot duration in minutes' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    __metadata("design:type", Number)
], AvailabilityItemDto.prototype, "slotDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AvailabilityItemDto.prototype, "isAvailable", void 0);
class SetAvailabilityDto {
}
exports.SetAvailabilityDto = SetAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AvailabilityItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AvailabilityItemDto),
    __metadata("design:type", Array)
], SetAvailabilityDto.prototype, "availabilities", void 0);
//# sourceMappingURL=set-availability.dto.js.map