import { Test, TestingModule } from '@nestjs/testing';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CollaborationStatus, DisputeOutcome, DisputeStatus, PaymentStatus } from '@prisma/client';
import { ConflictException, ForbiddenException } from '@nestjs/common';

describe('DisputesService', () => {
  let service: DisputesService;
  let prisma: any;

  const mockDispute = {
    id: 'disp-1',
    collaborationId: 'collab-1',
    campaignId: 'camp-1',
    initiatedBy: 'user-b1',
    reason: 'Deliverable not matching agreed brief',
    category: 'DELIVERABLE_QUALITY',
    status: DisputeStatus.OPEN,
    collaboration: {
      id: 'collab-1',
      campaignId: 'camp-1',
      creator: { userId: 'user-c1' },
      business: { userId: 'user-b1' },
      campaign: { title: 'Launch Campaign' },
      payment: {
        id: 'pay-1',
        grossAmount: 30000,
        escrowStatus: PaymentStatus.HELD,
      },
    },
  };

  beforeEach(async () => {
    prisma = {
      collaboration: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      dispute: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      payment: { update: jest.fn() },
      escrowTransaction: { create: jest.fn() },
      notification: { create: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
  });

  describe('createDispute', () => {
    it('should allow participant to raise a dispute and set status to DISPUTED', async () => {
      prisma.collaboration.findUnique.mockResolvedValue({
        id: 'collab-1',
        campaignId: 'camp-1',
        creator: { userId: 'user-c1' },
        business: { userId: 'user-b1' },
        campaign: { title: 'Brand Launch' },
        dispute: null,
      });
      prisma.dispute.create.mockResolvedValue(mockDispute);

      const result = await service.createDispute('user-b1', 'BUSINESS', {
        collaborationId: 'collab-1',
        reason: 'Poor quality video delivered',
        category: 'DELIVERABLE_QUALITY',
      });

      expect(result).toBeDefined();
      expect(prisma.collaboration.update).toHaveBeenCalledWith({
        where: { id: 'collab-1' },
        data: { status: CollaborationStatus.DISPUTED },
      });
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should reject dispute if already exists', async () => {
      prisma.collaboration.findUnique.mockResolvedValue({
        id: 'collab-1',
        campaignId: 'camp-1',
        creator: { userId: 'user-c1' },
        business: { userId: 'user-b1' },
        dispute: { id: 'existing-disp' },
      });

      await expect(
        service.createDispute('user-b1', 'BUSINESS', {
          collaborationId: 'collab-1',
          reason: 'Duplicate dispute',
          category: 'OTHER',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject non-participant from raising dispute', async () => {
      prisma.collaboration.findUnique.mockResolvedValue({
        id: 'collab-1',
        campaignId: 'camp-1',
        creator: { userId: 'user-c1' },
        business: { userId: 'user-b1' },
        dispute: null,
      });

      await expect(
        service.createDispute('user-stranger', 'CREATOR', {
          collaborationId: 'collab-1',
          reason: 'Not my business',
          category: 'OTHER',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('resolveDispute', () => {
    it('should resolve dispute with full business refund', async () => {
      prisma.dispute.findUnique.mockResolvedValue(mockDispute);
      prisma.dispute.update.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED,
        outcome: DisputeOutcome.REFUND_BUSINESS,
      });

      const result = await service.resolveDispute('admin-1', 'disp-1', {
        outcome: DisputeOutcome.REFUND_BUSINESS,
        amountRefunded: 30000,
        amountReleased: 0,
        resolutionNotes: 'Creator failed to provide deliverables per agreement',
      });

      expect(result).toBeDefined();
      expect(prisma.collaboration.update).toHaveBeenCalledWith({
        where: { id: 'collab-1' },
        data: expect.objectContaining({
          status: CollaborationStatus.CANCELLED,
        }),
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: expect.objectContaining({
          escrowStatus: PaymentStatus.REFUNDED,
        }),
      });
    });

    it('should resolve dispute with split payment and refund', async () => {
      prisma.dispute.findUnique.mockResolvedValue(mockDispute);
      prisma.dispute.update.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED,
        outcome: DisputeOutcome.PARTIAL_BOTH,
      });

      const result = await service.resolveDispute('admin-1', 'disp-1', {
        outcome: DisputeOutcome.PARTIAL_BOTH,
        amountRefunded: 15000,
        amountReleased: 15000,
        resolutionNotes: '50-50 split agreed after mediation',
      });

      expect(result).toBeDefined();
      expect(prisma.escrowTransaction.create).toHaveBeenCalledTimes(2);
    });
  });
});
