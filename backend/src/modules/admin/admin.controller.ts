import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Admin Dashboard & Analytics')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Admin platform analytics (Total users, 95/5 revenue split, AI usage, appointments)' })
  @ApiResponse({ status: 200, description: 'Platform statistics summary' })
  async getPlatformAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Admin list all system users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllUsers(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Admin view system audit logs (security event history)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.auditLogsService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }
}
