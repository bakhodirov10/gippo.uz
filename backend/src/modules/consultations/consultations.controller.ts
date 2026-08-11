import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Consultations')
@ApiBearerAuth()
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get('appointment/:appointmentId/token')
  @ApiOperation({ summary: 'Get secure video consultation room access token (Patient or Doctor)' })
  @ApiResponse({ status: 200, description: 'Token generated for room entry' })
  async getSessionToken(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.consultationsService.getSessionToken(appointmentId, userId);
  }
}
