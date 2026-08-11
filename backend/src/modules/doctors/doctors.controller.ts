import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { ReviewDoctorApplicationDto } from './dto/review-doctor-application.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Submit doctor registration application (status=PENDING)' })
  @ApiResponse({ status: 201, description: 'Application submitted for admin verification' })
  @ApiResponse({ status: 409, description: 'Email or license number already exists' })
  async registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.doctorsService.registerDoctor(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get public directory of verified/APPROVED doctors' })
  @ApiQuery({ name: 'specialtyId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findPublicDoctors(
    @Query('specialtyId') specialtyId?: string,
    @Query('search') search?: string,
  ) {
    return this.doctorsService.findPublicDoctors(specialtyId, search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public profile of an APPROVED doctor' })
  @ApiResponse({ status: 200, description: 'Approved doctor details' })
  @ApiResponse({ status: 404, description: 'Doctor not found or not approved' })
  async findPublicDoctorById(@Param('id') id: string) {
    return this.doctorsService.findPublicDoctorById(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.DOCTOR)
  @Patch('me')
  @ApiOperation({ summary: 'Doctor updates own profile' })
  async updateOwnProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateOwnProfile(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('admin/pending')
  @ApiOperation({ summary: 'Admin list all PENDING doctor applications' })
  async findPendingApplications() {
    return this.doctorsService.findPendingApplications();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('admin/:id/review')
  @ApiOperation({ summary: 'Admin approve, reject, or suspend doctor profile' })
  @ApiResponse({ status: 200, description: 'Doctor status updated and audit logged' })
  async reviewDoctorApplication(
    @CurrentUser('id') adminUserId: string,
    @Param('id') doctorProfileId: string,
    @Body() dto: ReviewDoctorApplicationDto,
  ) {
    return this.doctorsService.reviewDoctorApplication(
      adminUserId,
      doctorProfileId,
      dto,
    );
  }
}
