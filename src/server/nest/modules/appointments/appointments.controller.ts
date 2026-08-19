import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Roles(Role.PATIENT)
  @Post()
  @ApiOperation({ summary: 'Patient books an appointment with double-booking protection' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 409, description: 'Doctor is already booked for selected time slot' })
  async createAppointment(
    @CurrentUser('id') patientUserId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(patientUserId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all appointments for authenticated user (Patient/Doctor)' })
  async getUserAppointments(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.appointmentsService.getUserAppointments(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single appointment' })
  async getAppointmentById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.appointmentsService.getAppointmentById(id, userId, role);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an upcoming appointment' })
  async cancelAppointment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.appointmentsService.cancelAppointment(id, userId);
  }

  @Roles(Role.DOCTOR)
  @Post(':id/complete')
  @ApiOperation({ summary: 'Doctor marks consultation as completed' })
  async completeAppointment(
    @Param('id') id: string,
    @CurrentUser('id') doctorUserId: string,
  ) {
    return this.appointmentsService.completeAppointment(id, doctorUserId);
  }
}
