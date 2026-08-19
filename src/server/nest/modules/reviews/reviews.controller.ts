import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.PATIENT)
  @Post()
  @ApiOperation({ summary: 'Patient posts a review for a COMPLETED appointment' })
  @ApiResponse({ status: 201, description: 'Review submitted and doctor rating recalculated' })
  @ApiResponse({ status: 409, description: 'Review already exists for this appointment' })
  async createReview(
    @CurrentUser('id') patientUserId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(patientUserId, dto);
  }

  @Public()
  @Get('doctor/:doctorProfileId')
  @ApiOperation({ summary: 'Get list of reviews for a doctor' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDoctorReviews(
    @Param('doctorProfileId') doctorProfileId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getDoctorReviews(
      doctorProfileId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }
}
