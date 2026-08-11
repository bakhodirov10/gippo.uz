import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  @Post('create')
  @ApiOperation({ summary: 'Create payment checkout session for appointment' })
  @ApiResponse({ status: 201, description: 'Payment session created' })
  async createPayment(
    @CurrentUser('id') patientUserId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(patientUserId, dto);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Payment Provider Webhook Callback (Click, Payme, Mock)' })
  @ApiResponse({ status: 200, description: 'Webhook received & verified' })
  async handleWebhook(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    return this.paymentsService.handleWebhook(headers, body);
  }
}
