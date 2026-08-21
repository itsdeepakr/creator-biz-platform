import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { SubmitKycDto, ReviewKycDto } from './dto/submit-kyc.dto';
import { VerificationStatus, UserRole } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async submitKyc(userId: string, userRole: string, dto: SubmitKycDto) {
    if (userRole === UserRole.CREATOR) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) throw new NotFoundException('Creator profile not found');

      return this.prisma.creatorProfile.update({
        where: { id: creator.id },
        data: {
          panNumber: dto.panNumber || creator.panNumber,
          bankAccountNumber: dto.bankAccountNumber || creator.bankAccountNumber,
          bankIfsc: dto.bankIfsc || creator.bankIfsc,
          bankAccountHolderName: dto.bankAccountHolderName || creator.bankAccountHolderName,
          idDocumentUrl: dto.idDocumentUrl || creator.idDocumentUrl,
          idDocumentType: dto.idDocumentType || creator.idDocumentType,
          kycStatus: VerificationStatus.PENDING,
          verificationStatus: VerificationStatus.PENDING,
          verificationSubmittedAt: new Date(),
        },
      });
    } else if (userRole === UserRole.BUSINESS) {
      const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
      if (!business) throw new NotFoundException('Business profile not found');

      return this.prisma.businessProfile.update({
        where: { id: business.id },
        data: {
          panNumber: dto.panNumber || business.panNumber,
          gstNumber: dto.gstNumber || business.gstNumber,
          gstCertificateUrl: dto.gstCertificateUrl || business.gstCertificateUrl,
          businessLicenseUrl: dto.businessLicenseUrl || business.businessLicenseUrl,
          addressProofUrl: dto.addressProofUrl || business.addressProofUrl,
          ownerName: dto.ownerName || business.ownerName,
          ownerIdDocumentUrl: dto.ownerIdDocumentUrl || business.ownerIdDocumentUrl,
          verificationStatus: VerificationStatus.PENDING,
          verificationSubmittedAt: new Date(),
        },
      });
    }

    throw new BadRequestException('Invalid user role for KYC submission');
  }

  async getKycStatus(userId: string, userRole: string) {
    if (userRole === UserRole.CREATOR) {
      const creator = await this.prisma.creatorProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          isVerified: true,
          verificationStatus: true,
          verificationNotes: true,
          verificationSubmittedAt: true,
          verifiedAt: true,
          panNumber: true,
          bankAccountNumber: true,
          bankIfsc: true,
          bankAccountHolderName: true,
          idDocumentUrl: true,
          idDocumentType: true,
          kycStatus: true,
        },
      });
      return creator;
    } else if (userRole === UserRole.BUSINESS) {
      const business = await this.prisma.businessProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          verificationStatus: true,
          verificationNotes: true,
          verificationSubmittedAt: true,
          verifiedAt: true,
          gstNumber: true,
          gstCertificateUrl: true,
          businessLicenseUrl: true,
          panNumber: true,
          ownerName: true,
          ownerIdDocumentUrl: true,
          addressProofUrl: true,
        },
      });
      return business;
    }

    return { status: 'ADMIN', isVerified: true };
  }

  async getPendingKycSubmissions() {
    const [creators, businesses] = await Promise.all([
      this.prisma.creatorProfile.findMany({
        where: { verificationStatus: VerificationStatus.PENDING },
        include: {
          user: { select: { id: true, email: true, phone: true } },
        },
      }),
      this.prisma.businessProfile.findMany({
        where: { verificationStatus: VerificationStatus.PENDING },
        include: {
          user: { select: { id: true, email: true, phone: true } },
        },
      }),
    ]);

    return {
      creators,
      businesses,
      totalPending: creators.length + businesses.length,
    };
  }

  async reviewKyc(profileId: string, dto: ReviewKycDto) {
    const isApproved = dto.status === VerificationStatus.APPROVED;
    const verifiedAt = isApproved ? new Date() : null;

    if (dto.targetType === 'CREATOR') {
      const creator = await this.prisma.creatorProfile.findUnique({
        where: { id: profileId },
        include: { user: true },
      });
      if (!creator) throw new NotFoundException('Creator profile not found');

      const updated = await this.prisma.creatorProfile.update({
        where: { id: profileId },
        data: {
          verificationStatus: dto.status,
          kycStatus: dto.status,
          isVerified: isApproved,
          verificationNotes: dto.verificationNotes,
          verifiedAt,
        },
      });

      if (isApproved) {
        await this.prisma.user.update({
          where: { id: creator.userId },
          data: { isVerified: true },
        });
      }

      await this.prisma.notification.create({
        data: {
          userId: creator.userId,
          type: isApproved ? 'KYC_APPROVED' : 'KYC_REJECTED',
          title: isApproved ? 'KYC Verified! 🎉' : 'KYC Review Update',
          body: isApproved
            ? 'Your creator identity and bank documents have been verified.'
            : `KYC status: ${dto.status}. Notes: ${dto.verificationNotes || 'None'}`,
          channels: ['IN_APP', 'EMAIL'],
        },
      });

      return updated;
    } else if (dto.targetType === 'BUSINESS') {
      const business = await this.prisma.businessProfile.findUnique({
        where: { id: profileId },
        include: { user: true },
      });
      if (!business) throw new NotFoundException('Business profile not found');

      const updated = await this.prisma.businessProfile.update({
        where: { id: profileId },
        data: {
          verificationStatus: dto.status,
          verificationNotes: dto.verificationNotes,
          verifiedAt,
        },
      });

      if (isApproved) {
        await this.prisma.user.update({
          where: { id: business.userId },
          data: { isVerified: true },
        });
      }

      await this.prisma.notification.create({
        data: {
          userId: business.userId,
          type: isApproved ? 'KYC_APPROVED' : 'KYC_REJECTED',
          title: isApproved ? 'Business Verified! 🎉' : 'Business Verification Update',
          body: isApproved
            ? 'Your business registration and GST details have been verified.'
            : `Verification status: ${dto.status}. Notes: ${dto.verificationNotes || 'None'}`,
          channels: ['IN_APP', 'EMAIL'],
        },
      });

      return updated;
    }

    throw new BadRequestException('Invalid targetType');
  }
}
