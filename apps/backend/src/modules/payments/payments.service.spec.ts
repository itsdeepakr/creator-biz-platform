import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../common/services/prisma.service';
import { ConfigService } from '../../config/config.service';
import { CollaborationStatus, PaymentStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;

  const mockCollab = {
    id: 'collab-100',
    campaignId: 'camp-100',
    creatorId: 'creat-100',
    businessId: 'biz-100',
    agreedAmount: 50000,
    status: CollaborationStatus.ACCEPTED,
    creator: { userId: 'user-c1', displayName: 'Top Creator' },
    business: { userId: 'user-b1' },
    campaign: { id: 'camp-100', title: 'Festive Promo' },
    payment: {
      id: 'pay-100',
      grossAmount: 50000,
      platformFeeAmount: 5000,
      platformFeePercent: 10,
      netAmountToCreator: 45000,
      escrowStatus: PaymentStatus.PENDING,
    },
  };

  beforeEach(async () => {
    prisma = {
      collaboration: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        upsert: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      escrowTransaction: { create: jest.fn() },
      platformFee: { upsert: jest.fn(), updateMany: jest.fn() },
      notification: { create: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            razorpayKeyId: 'rzp_test_123',
            razorpayKeySecret: 'test-secret',
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('calculateFee', () => {
    it('should accurately calculate 10% platform fee and net creator payout', () => {
      const fee50k = service.calculateFee(50000);
      expect(fee50k.grossAmount).toBe(50000);
      expect(fee50k.platformFeePercent).toBe(10);
      expect(fee50k.platformFeeAmount).toBe(5000);
      expect(fee50k.netAmountToCreator).toBe(45000);

      const feeFractional = service.calculateFee(12345.67);
      expect(feeFractional.platformFeeAmount).toBe(1234.57);
      expect(feeFractional.netAmountToCreator).toBe(11111.10);
    });
  });

  describe('createEscrowOrder', () => {
    it('should create an escrow order for business client with exact 10% deduction', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollab);
      prisma.payment.upsert.mockResolvedValue(mockCollab.payment);

      const result = await service.createEscrowOrder('user-b1', {
        collaborationId: 'collab-100',
      });

      expect(result.grossAmount).toBe(50000);
      expect(result.platformFeeAmount).toBe(5000);
      expect(result.netAmountToCreator).toBe(45000);
      expect(result.amount).toBe(5000000); // 50,000 INR in paise
      expect(result.orderId).toContain('order_');
    });

    it('should forbid non-business user from creating escrow order', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollab);

      await expect(
        service.createEscrowOrder('user-c1', { collaborationId: 'collab-100' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyEscrowPayment', () => {
    it('should verify payment, hold funds in escrow, and transition collaboration to IN_PROGRESS', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollab);
      prisma.payment.update.mockResolvedValue({
        ...mockCollab.payment,
        escrowStatus: PaymentStatus.HELD,
      });
      prisma.collaboration.update.mockResolvedValue({
        ...mockCollab,
        status: CollaborationStatus.IN_PROGRESS,
      });

      const result = await service.verifyEscrowPayment('user-b1', {
        collaborationId: 'collab-100',
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_xyz',
        razorpaySignature: 'sig_abc',
      });

      expect(result).toBeDefined();
      expect(prisma.escrowTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'FUND',
          status: PaymentStatus.HELD,
        }),
      });
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('releasePayout', () => {
    it('should release escrow funds when deliverables are approved', async () => {
      const approvedCollab = {
        ...mockCollab,
        status: CollaborationStatus.APPROVED,
        payment: {
          ...mockCollab.payment,
          escrowStatus: PaymentStatus.HELD,
        },
      };

      prisma.collaboration.findUnique.mockResolvedValue(approvedCollab);
      prisma.payment.update.mockResolvedValue({
        ...approvedCollab.payment,
        escrowStatus: PaymentStatus.RELEASED,
      });
      prisma.collaboration.update.mockResolvedValue({
        ...approvedCollab,
        status: CollaborationStatus.PAID,
      });

      const result = await service.releasePayout('user-b1', 'BUSINESS', {
        collaborationId: 'collab-100',
      });

      expect(result).toBeDefined();
      expect(prisma.escrowTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'RELEASE',
          status: PaymentStatus.RELEASED,
        }),
      });
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should reject release if collaboration is not yet approved', async () => {
      prisma.collaboration.findUnique.mockResolvedValue({
        ...mockCollab,
        status: CollaborationStatus.IN_PROGRESS,
      });

      await expect(
        service.releasePayout('user-b1', 'BUSINESS', { collaborationId: 'collab-100' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundSplit', () => {
    it('should execute split refund by admin correctly', async () => {
      const disputedCollab = {
        ...mockCollab,
        status: CollaborationStatus.DISPUTED,
        payment: {
          ...mockCollab.payment,
          escrowStatus: PaymentStatus.HELD,
        },
      };

      prisma.collaboration.findUnique.mockResolvedValue(disputedCollab);
      prisma.payment.update.mockResolvedValue({
        ...disputedCollab.payment,
        escrowStatus: PaymentStatus.PARTIALLY_REFUNDED,
      });
      prisma.collaboration.update.mockResolvedValue({
        ...disputedCollab,
        status: CollaborationStatus.PAID,
      });

      const result = await service.refundSplit('admin-user', 'ADMIN', {
        collaborationId: 'collab-100',
        businessRefundAmount: 20000,
        creatorPayoutAmount: 30000,
        reason: 'Partial work delivered and accepted',
      });

      expect(result).toBeDefined();
      expect(prisma.escrowTransaction.create).toHaveBeenCalledTimes(2);
    });

    it('should reject split if total exceeds gross amount', async () => {
      prisma.collaboration.findUnique.mockResolvedValue(mockCollab);

      await expect(
        service.refundSplit('admin-user', 'ADMIN', {
          collaborationId: 'collab-100',
          businessRefundAmount: 40000,
          creatorPayoutAmount: 20000, // Total 60,000 > 50,000
          reason: 'Invalid split',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
