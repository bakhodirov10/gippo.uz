import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ example: 'admin@gippo.uz', description: 'Admin email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SuperAdminPass123!', description: 'Minimum 8 chars' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'System', description: 'First Name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Admin', description: 'Last Name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'gippo-admin-secure-registration-code-2026',
    description: 'Security Secret Code to create Admin',
  })
  @IsString()
  @IsNotEmpty()
  adminInviteSecret: string;
}
