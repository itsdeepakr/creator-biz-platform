import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { BusinessQueryDto } from './dto/business-query.dto';
import { Prisma, CampaignStatus } from '@prisma/client';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BusinessQueryDto) {
    const { industry, city, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BusinessProfileWhereInput = {
      showInSearch: true,
      user: { isActive: true },
      ...(industry ? { industry: { equals: industry, mode: 'insensitive' } } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { industry: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, businesses] = await Promise.all([
      this.prisma.businessProfile.count({ where }),
      this.prisma.businessProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              campaigns: { where: { status: CampaignStatus.ACTIVE } },
              collaborations: true,
            },
          },
        },
      }),
    ]);

    return {
      data: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const business = await this.prisma.businessProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        campaigns: {
          where: { status: CampaignStatus.ACTIVE },
          take: 5,
        },
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isVerified: true,
            reviewsReceived: {
              where: { isPublic: true },
              include: {
                reviewer: {
                  select: {
                    id: true,
                    creatorProfile: { select: { displayName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business profile not found');
    }

    return business;
  }

  async findByUserId(userId: string) {
    const business = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        campaigns: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business profile for user ${userId} not found`);
    }

    return business;
  }

  async updateProfile(userId: string, dto: UpdateBusinessProfileDto) {
    const profile = await this.findByUserId(userId);
    return this.prisma.businessProfile.update({
      where: { id: profile.id },
      data: dto,
    });
  }
}
