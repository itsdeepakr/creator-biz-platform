import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateReviewDto, RespondReviewDto } from './dto/create-review.dto';
import { CollaborationStatus, ReviewType } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(reviewerId: string, userRole: string, dto: CreateReviewDto) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: {
        creator: true,
        business: true,
      },
    });

    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }

    const validStatuses: CollaborationStatus[] = [
      CollaborationStatus.APPROVED,
      CollaborationStatus.PAID,
    ];

    if (!validStatuses.includes(collab.status)) {
      throw new BadRequestException(
        `Reviews can only be submitted after collaboration is approved or paid. Current status: '${collab.status}'`,
      );
    }

    // Verify reviewer belongs to collaboration
    const isCreatorReviewing = collab.creator.userId === reviewerId;
    const isBusinessReviewing = collab.business.userId === reviewerId;

    if (!isCreatorReviewing && !isBusinessReviewing) {
      throw new ForbiddenException('Only participants of this collaboration can submit a review');
    }

    const reviewType = isCreatorReviewing
      ? ReviewType.CREATOR_TO_BUSINESS
      : ReviewType.BUSINESS_TO_CREATOR;

    const targetRevieweeId = isCreatorReviewing ? collab.business.userId : collab.creator.userId;

    const existing = await this.prisma.review.findUnique({
      where: {
        collaborationId_reviewerId: {
          collaborationId: dto.collaborationId,
          reviewerId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already submitted a review for this collaboration');
    }

    return this.prisma.review.create({
      data: {
        collaborationId: dto.collaborationId,
        reviewerId,
        revieweeId: targetRevieweeId,
        type: reviewType,
        overallRating: dto.overallRating,
        criteriaRatings: dto.criteriaRatings as any,
        comment: dto.comment,
        isPublic: true,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            role: true,
            creatorProfile: { select: { displayName: true, avatarUrl: true } },
            businessProfile: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
    });
  }

  async getUserReviews(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where: { revieweeId: userId, isPublic: true } }),
      this.prisma.review.findMany({
        where: { revieweeId: userId, isPublic: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              role: true,
              creatorProfile: { select: { displayName: true, avatarUrl: true } },
              businessProfile: { select: { companyName: true, logoUrl: true } },
            },
          },
          collaboration: {
            select: {
              id: true,
              campaign: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    const aggregate = await this.prisma.review.aggregate({
      where: { revieweeId: userId, isPublic: true },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    });

    return {
      data: reviews,
      stats: {
        averageRating: aggregate._avg.overallRating ? Number(aggregate._avg.overallRating.toFixed(2)) : 0,
        totalReviews: aggregate._count.overallRating,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCollaborationReviews(collaborationId: string) {
    return this.prisma.review.findMany({
      where: { collaborationId },
      include: {
        reviewer: {
          select: {
            id: true,
            role: true,
            creatorProfile: { select: { displayName: true, avatarUrl: true } },
            businessProfile: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
    });
  }

  async respondToReview(userId: string, reviewId: string, dto: RespondReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    if (review.revieweeId !== userId) {
      throw new ForbiddenException('Only the reviewed user can respond to this review');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { businessResponse: dto.response },
    });
  }
}
