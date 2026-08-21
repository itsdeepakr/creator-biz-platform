import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import { CampaignStatus, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CampaignQueryDto) {
    const {
      category,
      deliverableType,
      platform,
      status,
      minBudget,
      maxBudget,
      businessId,
      search,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      ...(status ? { status } : { status: { in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED] } }),
      ...(businessId ? { businessId } : {}),
      ...(category ? { creatorCategories: { has: category } } : {}),
      ...(deliverableType ? { deliverableTypes: { has: deliverableType } } : {}),
      ...(platform ? { requiredPlatforms: { has: platform } } : {}),
      ...(minBudget !== undefined ? { budgetMin: { gte: minBudget } } : {}),
      ...(maxBudget !== undefined ? { budgetMax: { lte: maxBudget } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { business: { companyName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, campaigns] = await Promise.all([
      this.prisma.campaign.count({ where }),
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              industry: true,
              city: true,
              verificationStatus: true,
            },
          },
          _count: {
            select: {
              collaborations: true,
            },
          },
        },
      }),
    ]);

    return {
      data: campaigns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            userId: true,
            companyName: true,
            logoUrl: true,
            websiteUrl: true,
            industry: true,
            city: true,
            state: true,
            verificationStatus: true,
          },
        },
        _count: {
          select: {
            collaborations: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID '${id}' not found`);
    }

    return campaign;
  }

  async findMyCampaigns(userId: string, status?: CampaignStatus) {
    const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!business) {
      throw new NotFoundException('Business profile not found');
    }

    return this.prisma.campaign.findMany({
      where: {
        businessId: business.id,
        ...(status ? { status } : {}),
      },
      include: {
        _count: {
          select: {
            collaborations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
    if (!business) {
      throw new NotFoundException('Business profile not found. Please complete business onboarding first.');
    }

    return this.prisma.campaign.create({
      data: {
        businessId: business.id,
        title: dto.title,
        description: dto.description,
        status: dto.status || CampaignStatus.ACTIVE,
        budgetType: dto.budgetType,
        budgetMin: dto.budgetMin !== undefined ? new Prisma.Decimal(dto.budgetMin) : null,
        budgetMax: dto.budgetMax !== undefined ? new Prisma.Decimal(dto.budgetMax) : null,
        budgetCurrency: dto.budgetCurrency || 'INR',
        deliverableTypes: dto.deliverableTypes,
        deliverableDetails: dto.deliverableDetails,
        creatorCount: dto.creatorCount,
        creatorCategories: dto.creatorCategories || [],
        requiredPlatforms: dto.requiredPlatforms,
        requiredLocation: dto.requiredLocation,
        minFollowers: dto.minFollowers ?? 0,
        maxFollowers: dto.maxFollowers,
        minEngagementRate: dto.minEngagementRate !== undefined ? new Prisma.Decimal(dto.minEngagementRate) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
        autoCloseAfterHire: dto.autoCloseAfterHire ?? false,
        allowNegotiation: dto.allowNegotiation ?? true,
        maxRevisions: dto.maxRevisions ?? 2,
        autoApproveAfterDays: dto.autoApproveAfterDays ?? 7,
      },
      include: {
        business: true,
      },
    });
  }

  async update(userId: string, userRole: string, campaignId: string, dto: UpdateCampaignDto) {
    const campaign = await this.findById(campaignId);

    if (userRole !== UserRole.ADMIN && campaign.business.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this campaign');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...dto,
        ...(dto.budgetMin !== undefined ? { budgetMin: new Prisma.Decimal(dto.budgetMin) } : {}),
        ...(dto.budgetMax !== undefined ? { budgetMax: new Prisma.Decimal(dto.budgetMax) } : {}),
        ...(dto.minEngagementRate !== undefined ? { minEngagementRate: new Prisma.Decimal(dto.minEngagementRate) } : {}),
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
        ...(dto.applicationDeadline ? { applicationDeadline: new Date(dto.applicationDeadline) } : {}),
      },
      include: {
        business: true,
      },
    });
  }

  async updateStatus(userId: string, userRole: string, campaignId: string, status: CampaignStatus) {
    const campaign = await this.findById(campaignId);

    if (userRole !== UserRole.ADMIN && campaign.business.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this campaign status');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
      include: { business: true },
    });
  }

  async delete(userId: string, userRole: string, campaignId: string) {
    const campaign = await this.findById(campaignId);

    if (userRole !== UserRole.ADMIN && campaign.business.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this campaign');
    }

    // Check if there are ongoing collaborations
    const activeCollaborations = await this.prisma.collaboration.count({
      where: {
        campaignId,
        status: { in: ['IN_PROGRESS', 'DELIVERABLE_SUBMITTED', 'REVISION_REQUESTED', 'APPROVED'] },
      },
    });

    if (activeCollaborations > 0) {
      throw new BadRequestException('Cannot delete campaign with active or paid collaborations');
    }

    await this.prisma.campaign.delete({ where: { id: campaignId } });
    return { message: 'Campaign deleted successfully' };
  }
}
