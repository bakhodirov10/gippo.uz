import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all medical specialties' })
  async findAll() {
    return this.specialtiesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single specialty' })
  async findOne(@Param('id') id: string) {
    return this.specialtiesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new medical specialty (Admin only)' })
  @ApiResponse({ status: 201, description: 'Specialty created' })
  async create(@Body() dto: CreateSpecialtyDto) {
    return this.specialtiesService.create(dto);
  }
}
