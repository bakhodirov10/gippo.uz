import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'doctor-profile-uuid', description: 'ID of target doctor' })
  @IsUUID()
  @IsNotEmpty()
  doctorProfileId: string;

  @ApiProperty({ example: '2026-08-15T10:00:00.000Z', description: 'Start time ISO string' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-08-15T10:30:00.000Z', description: 'End time ISO string' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
