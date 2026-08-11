import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayloadUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Medical Assistant')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Send message to Free AI Medical Assistant (Backend Secured LLM Proxy)' })
  @ApiResponse({ status: 200, description: 'AI Assistant response with medical disclaimer' })
  async chat(
    @CurrentUser() user: JwtPayloadUser | undefined,
    @Body() dto: ChatMessageDto,
  ) {
    const userId = user?.id;
    return this.aiService.processChat(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('conversations')
  @ApiOperation({ summary: 'List user AI chat conversations' })
  async getUserConversations(@CurrentUser('id') userId: string) {
    return this.aiService.getUserConversations(userId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get full message history of an AI conversation' })
  async getConversationById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiService.getConversationById(id, userId);
  }
}
