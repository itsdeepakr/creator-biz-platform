import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationsService } from './collaborations.service';
import { PrismaService } from '../../common/services/prisma.service';
import { CollaborationStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('CollaborationsService', () => {
  let service: CollaborationsService;
  let prisma: any;

  const mockCollaboration = {
    id: 'collab-1',
    campaignId: 'camp-1',
    creatorId: 'creat-1',
    businessId: 'biz-1',
    status: CollaborationStatus.IN_PROGRESS,
    revisionCount: 0,
    creator: { userId: 'user-c1', displayName: 'Creator One' },
    business: { userId: 'user-b1' },
    campaign: { id: 'camp-1', title: 'Summer Launch', maxRevisions: 2 },
  };

  beforeEach(async () => {
    prisma = {
      collaboration: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      creatorProfile: { findUnique: jest.fn() },
      businessProfile: { findUnique: jest.fn() },
      notification: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CollaborationsService>(CollaborationsService);
  });

  describe('submitDeliverables', () => {
    it('should allow creator to submit deliverables when IN_PROGRESS', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollaboration);
      prisma.collaboration.update.mockResolvedValue({
        ...mockCollaboration,
        status: CollaborationStatus.DELIVERABLE_SUBMITTED,
      });

      const result = await service.submitDeliverables('user-c1', 'collab-1', {
        deliverableLinks: [{ url: 'https://instagram.com/p/123', type: 'reel' }],
        deliverableNotes: 'Draft reel ready for review',
      });

      expect(result.status).toBe(CollaborationStatus.DELIVERABLE_SUBMITTED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should reject deliverable submission from non-creator', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollaboration);

      await expect(
        service.submitDeliverables('user-other', 'collab-1', {
          deliverableLinks: [{ url: 'https://instagram.com/p/123' }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('requestRevision', () => {
    it('should allow business to request revision within max revisions limit', async () => {
      const submittedCollab = {
        ...mockCollaboration,
        status: CollaborationStatus.DELIVERABLE_SUBMITTED,
        revisionCount: 0,
      };

      prisma.collaboration.findUnique.mockResolvedValue(submittedCollab);
      prisma.collaboration.update.mockResolvedValue({
        ...submittedCollab,
        status: CollaborationStatus.REVISION_REQUESTED,
        revisionCount: 1,
      });

      const result = await service.requestRevision('user-b1', 'BUSINESS', 'collab-1', {
        revisionNotes: 'Please add brand hashtag in caption',
      });

      expect(result.status).toBe(CollaborationStatus.REVISION_REQUESTED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when max revision limit reached', async () => {
      const maxRevisionsCollab = {
        ...mockCollaboration,
        status: CollaborationStatus.DELIVERABLE_SUBMITTED,
        revisionCount: 2, // max is 2
      };

      prisma.collaboration.findUnique.mockResolvedValue(maxRevisionsCollab);

      await expect(
        service.requestRevision('user-b1', 'BUSINESS', 'collab-1', {
          revisionNotes: 'Another revision please',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveDeliverables', () => {
    it('should allow business to approve deliverables and transition to APPROVED', async () => {
      const submittedCollab = {
        ...mockCollaboration,
        status: CollaborationStatus.DELIVERABLE_SUBMITTED,
      };

      prisma.collaboration.findUnique.mockResolvedValue(submittedCollab);
      prisma.collaboration.update.mockResolvedValue({
        ...submittedCollab,
        status: CollaborationStatus.APPROVED,
      });

      const result = await service.approveDeliverables('user-b1', 'BUSINESS', 'collab-1');
      expect(result.status).toBe(CollaborationStatus.APPROVED);
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
