import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpecialtyDto {
  @ApiProperty({ example: 'Cardiology', description: 'Specialty title' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'cardiology', description: 'Unique slug identifier' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'Heart and cardiovascular system medical field', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://cdn.gippo.uz/icons/cardiology.svg', required: false })
  @IsOptional()
  @IsString()
  iconUrl?: string;
}
