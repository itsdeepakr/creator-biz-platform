import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { UpdateCreatorProfileDto } from './dto/update-creator-profile.dto';
import { CreatorQueryDto } from './dto/creator-query.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/create-service.dto';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { ConnectSocialDto } from './dto/connect-social.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CreatorQueryDto) {
    const {
      category,
      location,
      language,
      minFollowers,
      maxFollowers,
      minBudget,
      maxBudget,
      search,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CreatorProfileWhereInput = {
      user: { isActive: true },
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
      ...(language ? { languages: { has: language } } : {}),
      ...(minBudget !== undefined ? { minProjectBudget: { gte: minBudget } } : {}),
      ...(maxBudget !== undefined ? { minProjectBudget: { lte: maxBudget } } : {}),
      ...(search
        ? {
            OR: [
              { displayName: { contains: search, mode: 'insensitive' } },
              { bio: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { subCategories: { has: search } },
            ],
          }
        : {}),
      ...(minFollowers !== undefined || maxFollowers !== undefined
        ? {
            socialConnections: {
              some: {
                isActive: true,
                ...(minFollowers !== undefined ? { followerCount: { gte: minFollowers } } : {}),
                ...(maxFollowers !== undefined ? { followerCount: { lte: maxFollowers } } : {}),
              },
            },
          }
        : {}),
    };

    const [total, creators] = await Promise.all([
      this.prisma.creatorProfile.count({ where }),
      this.prisma.creatorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { isVerified: 'desc' },
        include: {
          socialConnections: {
            where: { isActive: true },
            select: {
              platform: true,
              username: true,
              followerCount: true,
              engagementRate: true,
              avgViews: true,
            },
          },
          services: {
            where: { isActive: true },
            take: 3,
          },
          user: {
            select: {
              id: true,
              email: true,
              isVerified: true,
            },
          },
        },
      }),
    ]);

    return {
      data: creators,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const creator = await this.prisma.creatorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        socialConnections: { where: { isActive: true } },
        services: { where: { isActive: true } },
        portfolioItems: true,
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
                    businessProfile: { select: { companyName: true, logoUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!creator) {
      throw new NotFoundException(`Creator profile not found`);
    }

    return creator;
  }

  async findByUserId(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        socialConnections: true,
        services: true,
        portfolioItems: true,
      },
    });

    if (!creator) {
      throw new NotFoundException(`Creator profile for user ${userId} not found`);
    }

    return creator;
  }

  async updateProfile(userId: string, dto: UpdateCreatorProfileDto) {
    const profile = await this.findByUserId(userId);

    return this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        ...dto,
        ...(dto.hourlyRate !== undefined ? { hourlyRate: new Prisma.Decimal(dto.hourlyRate) } : {}),
        ...(dto.minProjectBudget !== undefined ? { minProjectBudget: new Prisma.Decimal(dto.minProjectBudget) } : {}),
      },
      include: {
        socialConnections: true,
        services: true,
        portfolioItems: true,
      },
    });
  }

  // Services
  async createService(userId: string, dto: CreateServiceDto) {
    const profile = await this.findByUserId(userId);
    return this.prisma.service.create({
      data: {
        creatorId: profile.id,
        title: dto.title,
        description: dto.description,
        deliverableTypes: dto.deliverableTypes,
        price: new Prisma.Decimal(dto.price),
        currency: dto.currency || 'INR',
        isActive: true,
      },
    });
  }

  async updateService(userId: string, serviceId: string, dto: UpdateServiceDto) {
    const profile = await this.findByUserId(userId);
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });

    if (!service || service.creatorId !== profile.id) {
      throw new ForbiddenException('You do not own this service');
    }

    return this.prisma.service.update({
      where: { id: serviceId },
      data: {
        ...dto,
        ...(dto.price !== undefined ? { price: new Prisma.Decimal(dto.price) } : {}),
      },
    });
  }

  async deleteService(userId: string, serviceId: string) {
    const profile = await this.findByUserId(userId);
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });

    if (!service || service.creatorId !== profile.id) {
      throw new ForbiddenException('You do not own this service');
    }

    await this.prisma.service.delete({ where: { id: serviceId } });
    return { message: 'Service deleted successfully' };
  }

  // Portfolio
  async createPortfolioItem(userId: string, dto: CreatePortfolioItemDto) {
    const profile = await this.findByUserId(userId);
    return this.prisma.portfolioItem.create({
      data: {
        creatorId: profile.id,
        title: dto.title,
        description: dto.description,
        mediaUrls: dto.mediaUrls,
        tags: dto.tags || [],
        deliverableType: dto.deliverableType,
      },
    });
  }

  async updatePortfolioItem(userId: string, itemId: string, dto: UpdatePortfolioItemDto) {
    const profile = await this.findByUserId(userId);
    const item = await this.prisma.portfolioItem.findUnique({ where: { id: itemId } });

    if (!item || item.creatorId !== profile.id) {
      throw new ForbiddenException('You do not own this portfolio item');
    }

    return this.prisma.portfolioItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async deletePortfolioItem(userId: string, itemId: string) {
    const profile = await this.findByUserId(userId);
    const item = await this.prisma.portfolioItem.findUnique({ where: { id: itemId } });

    if (!item || item.creatorId !== profile.id) {
      throw new ForbiddenException('You do not own this portfolio item');
    }

    await this.prisma.portfolioItem.delete({ where: { id: itemId } });
    return { message: 'Portfolio item deleted successfully' };
  }

  // Social
  async connectSocial(userId: string, dto: ConnectSocialDto) {
    const profile = await this.findByUserId(userId);

    const social = await this.prisma.socialConnection.upsert({
      where: {
        platform_platformUserId: {
          platform: dto.platform,
          platformUserId: dto.platformUserId,
        },
      },
      update: {
        username: dto.username,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
        followerCount: dto.followerCount ?? 0,
        followingCount: dto.followingCount ?? 0,
        engagementRate: dto.engagementRate ? new Prisma.Decimal(dto.engagementRate) : null,
        avgViews: dto.avgViews ?? 0,
        audienceTopCities: dto.audienceTopCities || [],
        lastSyncedAt: new Date(),
        isActive: true,
      },
      create: {
        creatorId: profile.id,
        platform: dto.platform,
        platformUserId: dto.platformUserId,
        username: dto.username,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
        followerCount: dto.followerCount ?? 0,
        followingCount: dto.followingCount ?? 0,
        engagementRate: dto.engagementRate ? new Prisma.Decimal(dto.engagementRate) : null,
        avgViews: dto.avgViews ?? 0,
        audienceTopCities: dto.audienceTopCities || [],
        lastSyncedAt: new Date(),
        isActive: true,
      },
    });

    // Update aggregated social stats on creator profile
    const allSocial = await this.prisma.socialConnection.findMany({
      where: { creatorId: profile.id, isActive: true },
    });

    const totalFollowers = allSocial.reduce((sum, s) => sum + s.followerCount, 0);
    const avgEngagement = allSocial.length > 0
      ? (allSocial.reduce((sum, s) => sum + Number(s.engagementRate || 0), 0) / allSocial.length).toFixed(2)
      : 0;

    await this.prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        socialStats: {
          totalFollowers,
          averageEngagementRate: avgEngagement,
          connectedPlatforms: allSocial.map((s) => s.platform),
        },
        socialStatsRefreshedAt: new Date(),
      },
    });

    return social;
  }

  async getSocialConnections(userId: string) {
    const profile = await this.findByUserId(userId);
    return this.prisma.socialConnection.findMany({
      where: { creatorId: profile.id },
    });
  }
}
