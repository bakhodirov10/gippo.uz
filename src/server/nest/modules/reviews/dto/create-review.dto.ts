import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'appointment-uuid', description: 'ID of completed appointment' })
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ example: 5, description: 'Rating 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Excellent doctor! Very attentive and professional.' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
