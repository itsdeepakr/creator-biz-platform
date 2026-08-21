import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, RespondReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(user.id, user.role, dto);
  }

  @Public()
  @Get('user/:userId')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getUserReviews(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Public()
  @Get('collaboration/:collaborationId')
  async getCollaborationReviews(
    @Param('collaborationId') collaborationId: string,
  ) {
    return this.reviewsService.getCollaborationReviews(collaborationId);
  }

  @Post(':id/response')
  async respondToReview(
    @CurrentUser() user: AuthUser,
    @Param('id') reviewId: string,
    @Body() dto: RespondReviewDto,
  ) {
    return this.reviewsService.respondToReview(user.id, reviewId, dto);
  }
}
