import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateBidDto, CounterOfferDto } from './dto/create-bid.dto';
import { CollaborationStatus, CampaignStatus, Prisma } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBid(userId: string, campaignId: string, dto: CreateBidDto) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      throw new ForbiddenException('Only registered creators can bid on campaigns');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { business: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not currently accepting bids');
    }

    if (campaign.applicationDeadline && new Date() > new Date(campaign.applicationDeadline)) {
      throw new BadRequestException('Application deadline for this campaign has passed');
    }

    const existingBid = await this.prisma.collaboration.findFirst({
      where: {
        campaignId,
        creatorId: creator.id,
      },
    });

    if (existingBid) {
      throw new ConflictException('You have already submitted a bid for this campaign');
    }

    const collaboration = await this.prisma.collaboration.create({
      data: {
        campaignId,
        creatorId: creator.id,
        businessId: campaign.businessId,
        bidAmount: new Prisma.Decimal(dto.bidAmount),
        bidMessage: dto.bidMessage,
        agreedAmount: new Prisma.Decimal(dto.bidAmount),
        status: CollaborationStatus.APPLIED,
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            category: true,
            isVerified: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            budgetMin: true,
            budgetMax: true,
          },
        },
      },
    });

    // Create notification for business
    await this.prisma.notification.create({
      data: {
        userId: campaign.business.userId,
        type: 'BID_RECEIVED',
        title: 'New Bid Received',
        body: `${creator.displayName} submitted a bid of ₹${dto.bidAmount} for "${campaign.title}"`,
        data: { collaborationId: collaboration.id, campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return collaboration;
  }

  async getBidsForCampaign(userId: string, userRole: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { business: true },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // If business owner or admin, return all bids
    if (userRole === 'ADMIN' || campaign.business.userId === userId) {
      return this.prisma.collaboration.findMany({
        where: { campaignId },
        include: {
          creator: {
            include: {
              socialConnections: { where: { isActive: true } },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      });
    }

    // If creator, return only their bid
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) {
      return [];
    }

    return this.prisma.collaboration.findMany({
      where: { campaignId, creatorId: creator.id },
      include: {
        creator: true,
      },
    });
  }

  async getBidById(userId: string, userRole: string, bidId: string) {
    const bid = await this.prisma.collaboration.findUnique({
      where: { id: bidId },
      include: {
        creator: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
            socialConnections: true,
          },
        },
        business: {
          include: {
            user: { select: { id: true, email: true, phone: true } },
          },
        },
        campaign: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (
      userRole !== 'ADMIN' &&
      bid.creator.userId !== userId &&
      bid.business.userId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return bid;
  }

  async counterOffer(userId: string, userRole: string, bidId: string, dto: CounterOfferDto) {
    const bid = await this.getBidById(userId, userRole, bidId);

    const allowedStatuses: CollaborationStatus[] = [
      CollaborationStatus.APPLIED,
      CollaborationStatus.NEGOTIATING,
      CollaborationStatus.OFFERED,
    ];

    if (!allowedStatuses.includes(bid.status)) {
      throw new BadRequestException(`Cannot counter-offer when bid is in status '${bid.status}'`);
    }

    const updated = await this.prisma.collaboration.update({
      where: { id: bidId },
      data: {
        counterOfferAmount: new Prisma.Decimal(dto.counterOfferAmount),
        counterOfferMessage: dto.counterOfferMessage,
        counterOfferBy: userId,
        status: CollaborationStatus.NEGOTIATING,
      },
      include: {
        creator: true,
        business: true,
        campaign: true,
      },
    });

    // Notify the other party
    const targetUserId = bid.creator.userId === userId ? bid.business.userId : bid.creator.userId;
    await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'BID_COUNTERED',
        title: 'Counter Offer Received',
        body: `A counter offer of ₹${dto.counterOfferAmount} was proposed on "${bid.campaign.title}"`,
        data: { collaborationId: bidId, campaignId: bid.campaignId },
        channels: ['IN_APP'],
      },
    });

    return updated;
  }

  async acceptBid(userId: string, userRole: string, bidId: string) {
    const bid = await this.getBidById(userId, userRole, bidId);

    const allowedStatuses: CollaborationStatus[] = [
      CollaborationStatus.APPLIED,
      CollaborationStatus.NEGOTIATING,
      CollaborationStatus.OFFERED,
    ];

    if (!allowedStatuses.includes(bid.status)) {
      throw new BadRequestException(`Cannot accept bid in status '${bid.status}'`);
    }

    // Determine agreed amount (if counter offer was active and submitted by other party)
    let agreedAmount = bid.bidAmount;
    if (bid.counterOfferAmount && bid.counterOfferBy !== userId) {
      agreedAmount = bid.counterOfferAmount;
    }

    const updated = await this.prisma.collaboration.update({
      where: { id: bidId },
      data: {
        agreedAmount,
        status: CollaborationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        creator: true,
        business: true,
        campaign: true,
      },
    });

    // Notify other party
    const targetUserId = bid.creator.userId === userId ? bid.business.userId : bid.creator.userId;
    await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'BID_ACCEPTED',
        title: 'Bid Accepted!',
        body: `Collaboration agreed for ₹${agreedAmount} on "${bid.campaign.title}". Escrow payment required to start.`,
        data: { collaborationId: bidId, campaignId: bid.campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return updated;
  }

  async rejectBid(userId: string, userRole: string, bidId: string) {
    await this.getBidById(userId, userRole, bidId);

    const updated = await this.prisma.collaboration.update({
      where: { id: bidId },
      data: {
        status: CollaborationStatus.DECLINED,
      },
    });

    return updated;
  }

  async withdrawBid(userId: string, userRole: string, bidId: string) {
    const bid = await this.getBidById(userId, userRole, bidId);

    if (userRole !== 'ADMIN' && bid.creator.userId !== userId) {
      throw new ForbiddenException('Only the creator can withdraw their bid');
    }

    if (bid.status !== CollaborationStatus.APPLIED && bid.status !== CollaborationStatus.NEGOTIATING) {
      throw new BadRequestException('Cannot withdraw bid after acceptance');
    }

    return this.prisma.collaboration.update({
      where: { id: bidId },
      data: {
        status: CollaborationStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }
}
