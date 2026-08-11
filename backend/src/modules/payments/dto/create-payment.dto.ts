import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'appointment-uuid', description: 'Appointment ID to pay for' })
  @IsUUID()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ example: 'CLICK', default: 'MOCK', description: 'Payment provider: CLICK, PAYME, MOCK' })
  @IsOptional()
  @IsString()
  providerName?: string;
}
