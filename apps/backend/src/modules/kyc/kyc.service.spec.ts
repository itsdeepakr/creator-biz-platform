import { Test, TestingModule } from '@nestjs/testing';
import { KycService } from './kyc.service';
import { PrismaService } from '../../common/services/prisma.service';
import { UserRole, VerificationStatus } from '@prisma/client';

describe('KycService', () => {
  let service: KycService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      creatorProfile: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      businessProfile: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
  });

  describe('submitKyc', () => {
    it('should submit valid PAN and bank details for creator', async () => {
      prisma.creatorProfile.findUnique.mockResolvedValue({
        id: 'creat-1',
        userId: 'user-c1',
      });
      prisma.creatorProfile.update.mockResolvedValue({
        id: 'creat-1',
        panNumber: 'ABCDE1234F',
        kycStatus: VerificationStatus.PENDING,
      });

      const result = await service.submitKyc('user-c1', UserRole.CREATOR, {
        panNumber: 'ABCDE1234F',
        bankAccountNumber: '123456789012',
        bankIfsc: 'HDFC0001234',
        bankAccountHolderName: 'Rahul Sharma',
      });

      expect(result).toBeDefined();
      expect(prisma.creatorProfile.update).toHaveBeenCalledWith({
        where: { id: 'creat-1' },
        data: expect.objectContaining({
          panNumber: 'ABCDE1234F',
          kycStatus: VerificationStatus.PENDING,
        }),
      });
    });
  });

  describe('reviewKyc', () => {
    it('should approve creator KYC and set user isVerified to true', async () => {
      prisma.creatorProfile.findUnique.mockResolvedValue({
        id: 'creat-1',
        userId: 'user-c1',
      });
      prisma.creatorProfile.update.mockResolvedValue({
        id: 'creat-1',
        isVerified: true,
        kycStatus: VerificationStatus.APPROVED,
      });
      prisma.user.update.mockResolvedValue({ id: 'user-c1', isVerified: true });

      const result = await service.reviewKyc('creat-1', {
        targetType: 'CREATOR',
        status: VerificationStatus.APPROVED,
        verificationNotes: 'PAN and Bank account verified with NSDL and Penny drop',
      });

      expect(result).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-c1' },
        data: { isVerified: true },
      });
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });
});
