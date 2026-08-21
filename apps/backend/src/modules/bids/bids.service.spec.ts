import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CampaignStatus, CollaborationStatus } from '@prisma/client';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

describe('BidsService', () => {
  let service: BidsService;
  let prisma: any;

  const mockCreator = { id: 'creator-1', userId: 'user-c1', displayName: 'Creator One' };
  const mockCampaign = {
    id: 'campaign-1',
    businessId: 'biz-1',
    title: 'Diwali Campaign',
    status: CampaignStatus.ACTIVE,
    business: { userId: 'user-b1' },
    applicationDeadline: new Date(Date.now() + 86400000),
  };

  const mockCollaboration = {
    id: 'collab-1',
    campaignId: 'campaign-1',
    creatorId: 'creator-1',
    businessId: 'biz-1',
    bidAmount: 15000,
    agreedAmount: 15000,
    status: CollaborationStatus.APPLIED,
    creator: { userId: 'user-c1' },
    business: { userId: 'user-b1' },
    campaign: { id: 'campaign-1', title: 'Diwali Campaign' },
  };

  beforeEach(async () => {
    prisma = {
      creatorProfile: { findUnique: jest.fn() },
      campaign: { findUnique: jest.fn() },
      collaboration: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      notification: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
  });

  describe('createBid', () => {
    it('should allow a creator to submit a bid on an active campaign', async () => {
      prisma.creatorProfile.findUnique.mockResolvedValue(mockCreator);
      prisma.campaign.findUnique.mockResolvedValue(mockCampaign);
      prisma.collaboration.findFirst.mockResolvedValue(null);
      prisma.collaboration.create.mockResolvedValue(mockCollaboration);

      const result = await service.createBid('user-c1', 'campaign-1', {
        bidAmount: 15000,
        bidMessage: 'I would love to collaborate on this campaign!',
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(CollaborationStatus.APPLIED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should reject bid if user is not a creator', async () => {
      prisma.creatorProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.createBid('user-random', 'campaign-1', { bidAmount: 10000 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject bid if campaign is not active', async () => {
      prisma.creatorProfile.findUnique.mockResolvedValue(mockCreator);
      prisma.campaign.findUnique.mockResolvedValue({
        ...mockCampaign,
        status: CampaignStatus.PAUSED,
      });

      await expect(
        service.createBid('user-c1', 'campaign-1', { bidAmount: 10000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate bid by same creator', async () => {
      prisma.creatorProfile.findUnique.mockResolvedValue(mockCreator);
      prisma.campaign.findUnique.mockResolvedValue(mockCampaign);
      prisma.collaboration.findFirst.mockResolvedValue(mockCollaboration);

      await expect(
        service.createBid('user-c1', 'campaign-1', { bidAmount: 10000 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('counterOffer', () => {
    it('should allow business to propose a counter offer', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollaboration);
      prisma.collaboration.update.mockResolvedValue({
        ...mockCollaboration,
        counterOfferAmount: 12000,
        status: CollaborationStatus.NEGOTIATING,
      });

      const result = await service.counterOffer('user-b1', 'BUSINESS', 'collab-1', {
        counterOfferAmount: 12000,
        counterOfferMessage: 'Our budget is maximum 12,000 for this deliverable',
      });

      expect(result.status).toBe(CollaborationStatus.NEGOTIATING);
      expect(prisma.collaboration.update).toHaveBeenCalled();
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('acceptBid', () => {
    it('should transition collaboration status to ACCEPTED with agreedAmount', async () => {
      prisma.collaboration.findUnique.mockResolvedValue({
        ...mockCollaboration,
        counterOfferAmount: 13500,
        counterOfferBy: 'user-b1',
      });
      prisma.collaboration.update.mockResolvedValue({
        ...mockCollaboration,
        agreedAmount: 13500,
        status: CollaborationStatus.ACCEPTED,
      });

      const result = await service.acceptBid('user-c1', 'CREATOR', 'collab-1');

      expect(result.status).toBe(CollaborationStatus.ACCEPTED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
