import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Public()
  @Get('doctor/:doctorProfileId')
  @ApiOperation({ summary: 'Get working schedule of a doctor' })
  async getDoctorAvailability(@Param('doctorProfileId') doctorProfileId: string) {
    return this.availabilityService.getDoctorAvailability(doctorProfileId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.DOCTOR)
  @Put('me')
  @ApiOperation({ summary: 'Doctor sets/updates working weekly schedule' })
  async setDoctorAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.availabilityService.setDoctorAvailability(userId, dto);
  }
}
