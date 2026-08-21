import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateDisputeDto, AddEvidenceDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { CollaborationStatus, DisputeOutcome, DisputeStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDispute(userId: string, userRole: string, dto: CreateDisputeDto) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: {
        campaign: true,
        creator: true,
        business: true,
        dispute: true,
      },
    });

    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collab.creator.userId !== userId && collab.business.userId !== userId) {
      throw new ForbiddenException('Only parties involved in this collaboration can raise a dispute');
    }

    if (collab.dispute) {
      throw new ConflictException('A dispute has already been raised for this collaboration');
    }

    const isCreator = collab.creator.userId === userId;

    const dispute = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          collaborationId: collab.id,
          campaignId: collab.campaignId,
          initiatedBy: userId,
          reason: dto.reason,
          category: dto.category,
          status: DisputeStatus.OPEN,
          creatorEvidence: isCreator ? (dto.evidence as any) : undefined,
          businessEvidence: !isCreator ? (dto.evidence as any) : undefined,
        },
      });

      await tx.collaboration.update({
        where: { id: collab.id },
        data: { status: CollaborationStatus.DISPUTED },
      });

      return created;
    });

    // Notify the other party
    const targetUserId = isCreator ? collab.business.userId : collab.creator.userId;
    await this.prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'DISPUTE_RAISED',
        title: 'Dispute Raised',
        body: `A dispute was raised for "${collab.campaign.title}": ${dto.reason}`,
        data: { disputeId: dispute.id, collaborationId: collab.id },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return dispute;
  }

  async getDisputes(userId: string, userRole: string, status?: DisputeStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    let where: Prisma.DisputeWhereInput = status ? { status } : {};

    if (userRole !== UserRole.ADMIN) {
      where = {
        ...where,
        OR: [
          { collaboration: { creator: { userId } } },
          { collaboration: { business: { userId } } },
        ],
      };
    }

    const [total, disputes] = await Promise.all([
      this.prisma.dispute.count({ where }),
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          collaboration: {
            include: {
              campaign: { select: { id: true, title: true } },
              creator: { select: { id: true, displayName: true, avatarUrl: true } },
              business: { select: { id: true, companyName: true, logoUrl: true } },
              payment: { select: { id: true, grossAmount: true, escrowStatus: true } },
            },
          },
          initiator: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      data: disputes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDisputeById(userId: string, userRole: string, id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        collaboration: {
          include: {
            campaign: true,
            creator: {
              include: {
                user: { select: { id: true, email: true, phone: true } },
              },
            },
            business: {
              include: {
                user: { select: { id: true, email: true, phone: true } },
              },
            },
            payment: {
              include: { escrowTransactions: true, platformFee: true },
            },
          },
        },
        initiator: { select: { id: true, email: true, role: true } },
        resolver: { select: { id: true, email: true } },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      dispute.collaboration.creator.userId !== userId &&
      dispute.collaboration.business.userId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this dispute');
    }

    return dispute;
  }

  async addEvidence(userId: string, userRole: string, disputeId: string, dto: AddEvidenceDto) {
    const dispute = await this.getDisputeById(userId, userRole, disputeId);

    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new BadRequestException('Cannot add evidence to an already resolved dispute');
    }

    const isCreator = dispute.collaboration.creator.userId === userId;
    const isBusiness = dispute.collaboration.business.userId === userId;

    if (!isCreator && !isBusiness && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const currentEvidence = isCreator
      ? (dispute.creatorEvidence as any) || { items: [] }
      : (dispute.businessEvidence as any) || { items: [] };

    const updatedList = Array.isArray(currentEvidence.items) ? currentEvidence.items : [];
    updatedList.push({
      ...dto,
      submittedAt: new Date().toISOString(),
      submittedBy: userId,
    });

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        ...(isCreator
          ? { creatorEvidence: { items: updatedList } }
          : { businessEvidence: { items: updatedList } }),
      },
    });
  }

  async resolveDispute(adminId: string, disputeId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        collaboration: {
          include: {
            payment: true,
            creator: true,
            business: true,
            campaign: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const collab = dispute.collaboration;
    const payment = collab.payment;

    const result = await this.prisma.$transaction(async (tx) => {
      let finalCollabStatus: CollaborationStatus = CollaborationStatus.APPROVED;
      let finalPaymentStatus: PaymentStatus = PaymentStatus.RELEASED;

      if (dto.outcome === DisputeOutcome.REFUND_BUSINESS) {
        finalCollabStatus = CollaborationStatus.CANCELLED;
        finalPaymentStatus = PaymentStatus.REFUNDED;
      } else if (dto.outcome === DisputeOutcome.PAYOUT_CREATOR) {
        finalCollabStatus = CollaborationStatus.PAID;
        finalPaymentStatus = PaymentStatus.RELEASED;
      } else if (dto.outcome === DisputeOutcome.PARTIAL_BOTH) {
        finalCollabStatus = CollaborationStatus.PAID;
        finalPaymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
      }

      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          outcome: dto.outcome,
          amountRefunded: dto.amountRefunded ? new Prisma.Decimal(dto.amountRefunded) : null,
          amountReleased: dto.amountReleased ? new Prisma.Decimal(dto.amountReleased) : null,
          resolutionNotes: dto.resolutionNotes,
          resolvedAt: new Date(),
          assignedTo: adminId,
        },
      });

      await tx.collaboration.update({
        where: { id: collab.id },
        data: {
          status: finalCollabStatus,
          ...(finalCollabStatus === CollaborationStatus.PAID ? { paidAt: new Date() } : {}),
          ...(finalCollabStatus === CollaborationStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
        },
      });

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            escrowStatus: finalPaymentStatus,
            ...(finalPaymentStatus === PaymentStatus.RELEASED ? { releasedAt: new Date() } : {}),
            ...(finalPaymentStatus === PaymentStatus.REFUNDED || finalPaymentStatus === PaymentStatus.PARTIALLY_REFUNDED
              ? { refundedAt: new Date() }
              : {}),
          },
        });

        const eventId = `disp_res_${disputeId}_${Date.now()}`;
        if (dto.amountRefunded && dto.amountRefunded > 0) {
          await tx.escrowTransaction.create({
            data: {
              paymentId: payment.id,
              type: 'REFUND',
              amount: new Prisma.Decimal(dto.amountRefunded),
              status: PaymentStatus.REFUNDED,
              gatewayEventId: eventId,
            },
          });
        }
        if (dto.amountReleased && dto.amountReleased > 0) {
          await tx.escrowTransaction.create({
            data: {
              paymentId: payment.id,
              type: 'RELEASE',
              amount: new Prisma.Decimal(dto.amountReleased),
              status: PaymentStatus.RELEASED,
              gatewayEventId: `${eventId}_payout`,
            },
          });
        }
      }

      return updatedDispute;
    });

    // Notify both parties
    const outcomeText = `Dispute for "${collab.campaign.title}" resolved: ${dto.outcome}. Notes: ${dto.resolutionNotes}`;
    await Promise.all([
      this.prisma.notification.create({
        data: {
          userId: collab.creator.userId,
          type: 'DISPUTE_RESOLVED',
          title: 'Dispute Resolved',
          body: outcomeText,
          data: { disputeId, collaborationId: collab.id },
          channels: ['IN_APP', 'EMAIL'],
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: collab.business.userId,
          type: 'DISPUTE_RESOLVED',
          title: 'Dispute Resolved',
          body: outcomeText,
          data: { disputeId, collaborationId: collab.id },
          channels: ['IN_APP', 'EMAIL'],
        },
      }),
    ]);

    return result;
  }
}
