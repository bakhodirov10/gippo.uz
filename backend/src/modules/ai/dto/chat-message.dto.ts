import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({
    example: 'I have a mild headache and low-grade fever for 2 days. What should I do?',
    description: 'Patient question to AI Medical Assistant',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'conversation-uuid', required: false, description: 'Optional conversation ID to continue chat history' })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
