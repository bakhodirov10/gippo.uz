import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Doctor Earning Ledger')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.DOCTOR)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('me')
  @ApiOperation({ summary: 'Doctor gets earnings summary, pending balance, available balance & ledger history' })
  async getDoctorLedger(@CurrentUser('id') doctorUserId: string) {
    return this.ledgerService.getDoctorLedger(doctorUserId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Doctor requests withdrawal of available balance' })
  async requestWithdrawal(
    @CurrentUser('id') doctorUserId: string,
    @Body('amount') amount: number,
  ) {
    return this.ledgerService.requestWithdrawal(doctorUserId, amount);
  }
}
