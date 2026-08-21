import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../../common/services/prisma.service';
import { ConfigService } from '../../config/config.service';
import {
  CreateEscrowOrderDto,
  VerifyEscrowPaymentDto,
  ReleasePayoutDto,
  RefundSplitDto,
} from './dto/create-escrow-order.dto';
import { CollaborationStatus, PaymentStatus, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Calculates exact 10% platform fee and net creator payout.
   */
  calculateFee(grossAmount: number) {
    const feePercentage = 10;
    const platformFeeAmount = Math.round(grossAmount * 0.10 * 100) / 100;
    const netAmountToCreator = Math.round((grossAmount - platformFeeAmount) * 100) / 100;
    return {
      grossAmount,
      platformFeePercent: feePercentage,
      platformFeeAmount,
      netAmountToCreator,
    };
  }

  async createEscrowOrder(userId: string, dto: CreateEscrowOrderDto) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: { business: true, creator: true, campaign: true },
    });

    if (!collab) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collab.business.userId !== userId) {
      throw new ForbiddenException('Only the business client can fund escrow');
    }

    const allowedStatuses: CollaborationStatus[] = [
      CollaborationStatus.ACCEPTED,
      CollaborationStatus.APPLIED,
      CollaborationStatus.OFFERED,
    ];

    if (!allowedStatuses.includes(collab.status)) {
      throw new BadRequestException(
        `Cannot initiate escrow payment when collaboration is in '${collab.status}'`,
      );
    }

    const grossAmount = Number(collab.agreedAmount || collab.bidAmount);
    const { platformFeeAmount, platformFeePercent, netAmountToCreator } = this.calculateFee(grossAmount);

    const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payment = await this.prisma.payment.upsert({
      where: { collaborationId: collab.id },
      update: {
        grossAmount: new Prisma.Decimal(grossAmount),
        platformFeeAmount: new Prisma.Decimal(platformFeeAmount),
        platformFeePercent: new Prisma.Decimal(platformFeePercent),
        netAmountToCreator: new Prisma.Decimal(netAmountToCreator),
        razorpayOrderId,
        escrowStatus: PaymentStatus.PENDING,
      },
      create: {
        collaborationId: collab.id,
        businessId: collab.businessId,
        creatorId: collab.creatorId,
        grossAmount: new Prisma.Decimal(grossAmount),
        platformFeeAmount: new Prisma.Decimal(platformFeeAmount),
        platformFeePercent: new Prisma.Decimal(platformFeePercent),
        netAmountToCreator: new Prisma.Decimal(netAmountToCreator),
        currency: 'INR',
        razorpayOrderId,
        escrowStatus: PaymentStatus.PENDING,
      },
    });

    return {
      orderId: razorpayOrderId,
      amount: Math.round(grossAmount * 100), // in paise for Razorpay checkout
      currency: 'INR',
      keyId: this.configService.razorpayKeyId || 'rzp_test_mock_key',
      paymentId: payment.id,
      grossAmount,
      platformFeeAmount,
      netAmountToCreator,
    };
  }

  async verifyEscrowPayment(userId: string, dto: VerifyEscrowPaymentDto) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: { business: true, creator: true, campaign: true, payment: true },
    });

    if (!collab || !collab.payment) {
      throw new NotFoundException('Collaboration or payment record not found');
    }

    // Verify signature if secret is provided
    const secret = this.configService.razorpayKeySecret;
    if (secret && secret !== 'test-secret') {
      const generatedSignature = createHmac('sha256', secret)
        .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== dto.razorpaySignature) {
        throw new BadRequestException('Invalid payment signature verification failed');
      }
    }

    // Update payment, escrow transactions, and collaboration state
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: collab.payment!.id },
        data: {
          razorpayPaymentId: dto.razorpayPaymentId,
          escrowStatus: PaymentStatus.HELD,
          gatewayResponse: { verifiedAt: new Date().toISOString(), signature: dto.razorpaySignature },
        },
      });

      await tx.escrowTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'FUND',
          amount: payment.grossAmount,
          status: PaymentStatus.HELD,
          gatewayEventId: dto.razorpayPaymentId,
        },
      });

      await tx.platformFee.upsert({
        where: { paymentId: payment.id },
        update: {
          feeType: 'PLATFORM_COMMISSION_10_PERCENT',
          amount: payment.platformFeeAmount,
          percentage: payment.platformFeePercent,
          netRevenue: payment.platformFeeAmount,
          settlementStatus: 'PENDING',
        },
        create: {
          paymentId: payment.id,
          feeType: 'PLATFORM_COMMISSION_10_PERCENT',
          amount: payment.platformFeeAmount,
          percentage: payment.platformFeePercent,
          netRevenue: payment.platformFeeAmount,
          settlementStatus: 'PENDING',
        },
      });

      const updatedCollab = await tx.collaboration.update({
        where: { id: collab.id },
        data: {
          status: CollaborationStatus.IN_PROGRESS,
          startedAt: new Date(),
        },
        include: {
          creator: true,
          business: true,
          campaign: true,
        },
      });

      return { payment, collaboration: updatedCollab };
    });

    // Send notifications
    await this.prisma.notification.create({
      data: {
        userId: collab.creator.userId,
        type: 'PAYMENT_HELD',
        title: 'Escrow Funded! Start Working 🚀',
        body: `Payment of ₹${collab.payment.grossAmount} is secured in escrow for "${collab.campaign.title}". You can start creating!`,
        data: { collaborationId: collab.id, campaignId: collab.campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return result;
  }

  async releasePayout(userId: string, userRole: string, dto: ReleasePayoutDto) {
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: { business: true, creator: true, campaign: true, payment: true },
    });

    if (!collab || !collab.payment) {
      throw new NotFoundException('Collaboration or payment record not found');
    }

    if (userRole !== UserRole.ADMIN && collab.business.userId !== userId) {
      throw new ForbiddenException('Only the business owner or admin can release escrow payouts');
    }

    const allowedStatuses: CollaborationStatus[] = [
      CollaborationStatus.APPROVED,
      CollaborationStatus.DELIVERABLE_SUBMITTED,
    ];

    if (!allowedStatuses.includes(collab.status) && userRole !== UserRole.ADMIN) {
      throw new BadRequestException(
        `Cannot release payout when deliverables are in status '${collab.status}'. Deliverables must be approved.`,
      );
    }

    const releaseId = `rel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: collab.payment!.id },
        data: {
          escrowStatus: PaymentStatus.RELEASED,
          releasedAt: new Date(),
          razorpayReleaseId: releaseId,
        },
      });

      await tx.escrowTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'RELEASE',
          amount: payment.netAmountToCreator,
          status: PaymentStatus.RELEASED,
          gatewayEventId: releaseId,
        },
      });

      await tx.platformFee.updateMany({
        where: { paymentId: payment.id },
        data: {
          settlementStatus: 'SETTLED',
          settledAt: new Date(),
        },
      });

      const updatedCollab = await tx.collaboration.update({
        where: { id: collab.id },
        data: {
          status: CollaborationStatus.PAID,
          paidAt: new Date(),
        },
        include: {
          creator: true,
          business: true,
          campaign: true,
        },
      });

      return { payment, collaboration: updatedCollab };
    });

    // Notify Creator
    await this.prisma.notification.create({
      data: {
        userId: collab.creator.userId,
        type: 'PAYMENT_RELEASED',
        title: 'Payout Released! 💰',
        body: `₹${collab.payment.netAmountToCreator} has been released to your bank account for "${collab.campaign.title}".`,
        data: { collaborationId: collab.id, campaignId: collab.campaignId },
        channels: ['IN_APP', 'EMAIL'],
      },
    });

    return result;
  }

  async refundSplit(userId: string, userRole: string, dto: RefundSplitDto) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can execute split refunds');
    }

    const collab = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: { business: true, creator: true, campaign: true, payment: true },
    });

    if (!collab || !collab.payment) {
      throw new NotFoundException('Collaboration or payment record not found');
    }

    const gross = Number(collab.payment.grossAmount);
    const totalSplit = dto.businessRefundAmount + dto.creatorPayoutAmount;

    if (totalSplit > gross + 0.01) {
      throw new BadRequestException(
        `Total split amount (₹${totalSplit}) exceeds gross payment amount (₹${gross})`,
      );
    }

    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return this.prisma.$transaction(async (tx) => {
      const isFullRefund = dto.businessRefundAmount >= gross;
      const newStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

      const payment = await tx.payment.update({
        where: { id: collab.payment!.id },
        data: {
          escrowStatus: newStatus,
          refundedAt: new Date(),
          gatewayResponse: {
            splitDetails: {
              businessRefund: dto.businessRefundAmount,
              creatorPayout: dto.creatorPayoutAmount,
              reason: dto.reason,
            },
          },
        },
      });

      if (dto.businessRefundAmount > 0) {
        await tx.escrowTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'REFUND',
            amount: new Prisma.Decimal(dto.businessRefundAmount),
            status: PaymentStatus.REFUNDED,
            gatewayEventId: refundId,
          },
        });
      }

      if (dto.creatorPayoutAmount > 0) {
        await tx.escrowTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'RELEASE',
            amount: new Prisma.Decimal(dto.creatorPayoutAmount),
            status: PaymentStatus.RELEASED,
            gatewayEventId: `${refundId}_payout`,
          },
        });
      }

      const collabStatus = isFullRefund ? CollaborationStatus.CANCELLED : CollaborationStatus.PAID;
      const updatedCollab = await tx.collaboration.update({
        where: { id: collab.id },
        data: {
          status: collabStatus,
          cancelledAt: isFullRefund ? new Date() : null,
          paidAt: !isFullRefund ? new Date() : null,
        },
      });

      return { payment, collaboration: updatedCollab };
    });
  }

  async handleWebhook(body: any, signature: string) {
    const webhookSecret = this.configService.razorpayWebhookSecret;
    if (webhookSecret) {
      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(typeof body === 'string' ? body : JSON.stringify(body))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestException('Webhook signature verification failed');
      }
    }

    const event = typeof body === 'string' ? JSON.parse(body) : body;
    this.logger.log(`Received Razorpay webhook event: ${event.event}`);

    return { status: 'ok', received: true, event: event.event };
  }

  async getPaymentHistory(userId: string, userRole: string) {
    let where: Prisma.PaymentWhereInput = {};

    if (userRole === UserRole.ADMIN) {
      where = {};
    } else if (userRole === UserRole.CREATOR) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) return [];
      where = { creatorId: creator.id };
    } else if (userRole === UserRole.BUSINESS) {
      const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
      if (!business) return [];
      where = { businessId: business.id };
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        collaboration: {
          include: {
            campaign: { select: { id: true, title: true } },
            creator: { select: { id: true, displayName: true } },
            business: { select: { id: true, companyName: true } },
          },
        },
        escrowTransactions: true,
        platformFee: true,
      },
    });
  }

  async getCollaborationPayment(userId: string, userRole: string, collaborationId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { collaborationId },
      include: {
        escrowTransactions: true,
        platformFee: true,
        collaboration: {
          include: {
            campaign: true,
            creator: true,
            business: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      payment.collaboration.creator.userId !== userId &&
      payment.collaboration.business.userId !== userId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }
}
