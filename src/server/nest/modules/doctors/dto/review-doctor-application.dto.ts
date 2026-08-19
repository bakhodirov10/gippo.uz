import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DoctorStatus } from '@prisma/client';

export class ReviewDoctorApplicationDto {
  @ApiProperty({
    enum: DoctorStatus,
    example: DoctorStatus.APPROVED,
    description: 'Status decision: APPROVED, REJECTED, SUSPENDED',
  })
  @IsEnum(DoctorStatus)
  @IsNotEmpty()
  status: DoctorStatus;

  @ApiProperty({
    example: 'License document valid and verified by ministry of health.',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: 'Please provide updated medical license scan.',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
