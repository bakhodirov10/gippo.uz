import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDoctorDto {
  @ApiProperty({ example: 'dr.valiyev@gippo.uz', description: 'Doctor Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'Password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Dr. Botir', description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Valiyev', description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+998912345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Experienced Cardiologist with 10+ years practice.' })
  @IsString()
  @IsNotEmpty()
  bio: string;

  @ApiProperty({ example: 10, description: 'Years of clinical experience' })
  @IsNumber()
  @Min(0)
  experienceYears: number;

  @ApiProperty({ example: 'Tashkent Medical Academy, MD' })
  @IsString()
  @IsNotEmpty()
  education: string;

  @ApiProperty({ example: 'UZ-MED-LIC-987654', description: 'Medical License Number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ example: 150000, description: 'Consultation Price in UZS' })
  @IsNumber()
  @Min(0)
  consultationFee: number;

  @ApiProperty({
    example: ['specialty-uuid-1', 'specialty-uuid-2'],
    description: 'Array of Specialty IDs',
  })
  @IsArray()
  @IsString({ each: true })
  specialtyIds: string[];
}
