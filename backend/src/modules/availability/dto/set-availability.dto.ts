import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityItemDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00', description: 'Start time HH:mm' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time HH:mm' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 30, description: 'Slot duration in minutes' })
  @IsInt()
  @Min(15)
  slotDurationMinutes: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilityItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItemDto)
  availabilities: AvailabilityItemDto[];
}
