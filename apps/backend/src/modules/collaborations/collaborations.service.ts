import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { SubmitDeliverableDto, RequestRevisionDto, CancelCollaborationDto } from './dto/submit-deliverable.dto';
import { CollaborationQueryDto } from './dto/collaboration-query.dto';
import { CollaborationStatus, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class CollaborationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, userRole: string, query: CollaborationQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    let where: Prisma.CollaborationWhereInput = {};

    if (userRole === UserRole.ADMIN) {
      where = status ? { status } : {};
    } else if (userRole === UserRole.CREATOR) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      where = { creatorId: creator.id, ...(status ? { status } : {}) };
    } else if (userRole === UserRole.BUSINESS) {
      const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
      if (!business) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      where = { businessId: business.id, ...(status ? { status } : {}) };
    }

    const [total, items] = await Promise.all([
      this.prisma.collaboration.count({ where }),
      this.prisma.collaboration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              budgetType: true,
              deliverableTypes: true,
            },
          },
          creator: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              category: true,
            },
          },
          business: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
            },
          },
          payment: {
            select: {
              id: true,
              grossAmount: true,
              escrowStatus: true,
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(userId: string, userRole: string, id: string) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id },
      include: {
        campaign: true,
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
        payment: {
          include: {
            escrowTransactions: true,
          },
        },
        reviews: true,
        dispute: true,
      },
    });

    if (!collab) {
      throw new NotFoundException(`Collaboration with ID '${id}' not found`);
    }

    if (
      userRole !== UserRole.ADMIN &&
      collab.creator.userId !== userId &&
      collab.business.userId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this collaboration');
    }

    return collab;
  }

  async submitDeliverables(userId: string, collabId: string, dto: SubmitDeliverableDto) {
    const collab = await this.findById(userId, UserRole.CREATOR, collabId);

    if (collab.creator.userId !== userId) {
      throw new ForbiddenException('Only the assigned creator can submit deliverables');
    }

    const allowedStatuses: CollaborationStatus[] = [
      CollaborationStatus.IN_PROGRESS,
      CollaborationStatus.REVISION_REQUESTED,
    ];

    if (!allowedStatuses.includes(collab.status)) {
      throw new BadRequestException(
        `Cannot submit deliverables in status '${collab.status}'. Collaboration must be IN_PROGRESS or REVISION_REQUESTED.`,
      );
    }

    const updated = await this.prisma.collaboration.update({
      where: { id: collabId },
      data: {
        status: CollaborationStatus.DELIVERABLE_SUBMITTED,
        deliverableLinks: dto.deliverableLinks as any,
        deliverableNotes: dto.deliverableNotes,
        deliveredAt: new Date(),
      },
      include: {
        campaign: true,
        creator: true,
        business: true,
      },
    });

    // Notify Business
    await this.prisma.notification.create({
      data: {
        userId: collab.business.userId,
        type: 'DELIVERABLE_SUBMITTED',
        title: 'Deliverables Submitted!',
        body: `${collab.creator.displayName} has submitted the deliverables for "${collab.campaign.title}". Please review.`,
        data: { collaborationId: collabId, campaignId: collab.campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return updated;
  }

  async requestRevision(userId: string, userRole: string, collabId: string, dto: RequestRevisionDto) {
    const collab = await this.findById(userId, userRole, collabId);

    if (userRole !== UserRole.ADMIN && collab.business.userId !== userId) {
      throw new ForbiddenException('Only the business owner or admin can request revisions');
    }

    if (collab.status !== CollaborationStatus.DELIVERABLE_SUBMITTED) {
      throw new BadRequestException(
        `Cannot request revision in status '${collab.status}'. Deliverables must be submitted first.`,
      );
    }

    const maxRevisions = collab.campaign.maxRevisions ?? 2;
    if (collab.revisionCount >= maxRevisions) {
      throw new BadRequestException(
        `Maximum revision limit of ${maxRevisions} reached. You can either approve or raise a dispute.`,
      );
    }

    const updated = await this.prisma.collaboration.update({
      where: { id: collabId },
      data: {
        status: CollaborationStatus.REVISION_REQUESTED,
        revisionCount: { increment: 1 },
        revisionRequest: {
          notes: dto.revisionNotes,
          requestedAt: new Date().toISOString(),
        } as any,
        revisionRequestedBy: userId,
        revisionDeadline: dto.revisionDeadline ? new Date(dto.revisionDeadline) : null,
      },
      include: {
        campaign: true,
        creator: true,
        business: true,
      },
    });

    // Notify Creator
    await this.prisma.notification.create({
      data: {
        userId: collab.creator.userId,
        type: 'REVISION_REQUESTED',
        title: 'Revision Requested',
        body: `Revision requested on "${collab.campaign.title}": ${dto.revisionNotes}`,
        data: { collaborationId: collabId, campaignId: collab.campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return updated;
  }

  async approveDeliverables(userId: string, userRole: string, collabId: string) {
    const collab = await this.findById(userId, userRole, collabId);

    if (userRole !== UserRole.ADMIN && collab.business.userId !== userId) {
      throw new ForbiddenException('Only the business owner or admin can approve deliverables');
    }

    const allowedStatuses: CollaborationStatus[] = [
      CollaborationStatus.DELIVERABLE_SUBMITTED,
      CollaborationStatus.REVISION_REQUESTED,
    ];

    if (!allowedStatuses.includes(collab.status)) {
      throw new BadRequestException(
        `Cannot approve deliverables in status '${collab.status}'.`,
      );
    }

    const updated = await this.prisma.collaboration.update({
      where: { id: collabId },
      data: {
        status: CollaborationStatus.APPROVED,
        approvedAt: new Date(),
      },
      include: {
        campaign: true,
        creator: true,
        business: true,
        payment: true,
      },
    });

    // Notify Creator
    await this.prisma.notification.create({
      data: {
        userId: collab.creator.userId,
        type: 'COLLABORATION_APPROVED',
        title: 'Deliverables Approved! 🎉',
        body: `Your work for "${collab.campaign.title}" was approved! Escrow payment will be released.`,
        data: { collaborationId: collabId, campaignId: collab.campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return updated;
  }

  async cancelCollaboration(
    userId: string,
    userRole: string,
    collabId: string,
    dto: CancelCollaborationDto,
  ) {
    const collab = await this.findById(userId, userRole, collabId);

    const cancellableStatuses: CollaborationStatus[] = [
      CollaborationStatus.APPLIED,
      CollaborationStatus.NEGOTIATING,
      CollaborationStatus.OFFERED,
      CollaborationStatus.ACCEPTED,
    ];

    if (!cancellableStatuses.includes(collab.status) && userRole !== UserRole.ADMIN) {
      throw new BadRequestException(
        `Cannot cancel collaboration in active status '${collab.status}'. Please raise a dispute instead.`,
      );
    }

    const updated = await this.prisma.collaboration.update({
      where: { id: collabId },
      data: {
        status: CollaborationStatus.CANCELLED,
        cancelledAt: new Date(),
        deliverableNotes: dto.reason ? `Cancelled: ${dto.reason}` : undefined,
      },
    });

    return updated;
  }
}
