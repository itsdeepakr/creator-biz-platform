import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CampaignStatus, DisputeStatus, PaymentStatus, VerificationStatus } from '@prisma/client';
import { ModerateCampaignDto, ModerateUserDto } from './dto/moderate-campaign.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpiAnalytics() {
    const [
      totalUsers,
      totalCreators,
      totalBusinesses,
      activeCampaigns,
      totalCampaigns,
      totalCollaborations,
      completedCollaborations,
      activeDisputesCount,
      pendingCreatorKyc,
      pendingBusinessKyc,
      flaggedMessagesCount,
      revenueAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.creatorProfile.count(),
      this.prisma.businessProfile.count(),
      this.prisma.campaign.count({ where: { status: CampaignStatus.ACTIVE } }),
      this.prisma.campaign.count(),
      this.prisma.collaboration.count(),
      this.prisma.collaboration.count({ where: { status: { in: ['APPROVED', 'PAID'] } } }),
      this.prisma.dispute.count({ where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] } } }),
      this.prisma.creatorProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      this.prisma.businessProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      this.prisma.message.count({ where: { isFlagged: true } }),
      this.prisma.payment.aggregate({
        where: { escrowStatus: { in: [PaymentStatus.HELD, PaymentStatus.RELEASED] } },
        _sum: {
          grossAmount: true,
          platformFeeAmount: true,
          netAmountToCreator: true,
        },
      }),
    ]);

    const totalGmv = revenueAggregate._sum.grossAmount ? Number(revenueAggregate._sum.grossAmount) : 0;
    const totalPlatformRevenue = revenueAggregate._sum.platformFeeAmount
      ? Number(revenueAggregate._sum.platformFeeAmount)
      : 0;
    const totalCreatorPayouts = revenueAggregate._sum.netAmountToCreator
      ? Number(revenueAggregate._sum.netAmountToCreator)
      : 0;

    return {
      totalUsers,
      totalCreators,
      totalBusinesses,
      activeCampaigns,
      totalCampaigns,
      totalCollaborations,
      completedCollaborations,
      totalGmv,
      totalPlatformRevenue,
      totalCreatorPayouts,
      pendingKycCount: pendingCreatorKyc + pendingBusinessKyc,
      activeDisputesCount,
      flaggedMessagesCount,
    };
  }

  async getRevenueAnalytics() {
    const payments = await this.prisma.payment.findMany({
      where: { escrowStatus: { in: [PaymentStatus.HELD, PaymentStatus.RELEASED] } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const monthlyBreakdown: Record<string, { gmv: number; revenue: number; count: number }> = {};

    for (const p of payments) {
      const monthKey = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = { gmv: 0, revenue: 0, count: 0 };
      }
      monthlyBreakdown[monthKey].gmv += Number(p.grossAmount);
      monthlyBreakdown[monthKey].revenue += Number(p.platformFeeAmount);
      monthlyBreakdown[monthKey].count += 1;
    }

    return {
      monthlyBreakdown,
      recentPaymentsCount: payments.length,
    };
  }

  async getTransactions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, transactions] = await Promise.all([
      this.prisma.escrowTransaction.count(),
      this.prisma.escrowTransaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payment: {
            include: {
              collaboration: {
                select: {
                  id: true,
                  campaign: { select: { id: true, title: true } },
                  creator: { select: { id: true, displayName: true } },
                  business: { select: { id: true, companyName: true } },
                },
              },
              platformFee: true,
            },
          },
        },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async moderateCampaign(campaignId: string, dto: ModerateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: dto.status },
      include: { business: true },
    });
  }

  async moderateUser(userId: string, dto: ModerateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: dto.isActive },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
