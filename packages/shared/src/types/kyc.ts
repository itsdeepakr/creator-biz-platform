import { KycDocumentType, VerificationStatus } from './enums';

export interface CreatorKycSubmissionDto {
  panNumber: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountHolderName: string;
  idDocumentType: KycDocumentType | string;
  idDocumentUrl: string;
}

export interface BusinessKycSubmissionDto {
  gstNumber?: string;
  gstCertificateUrl?: string;
  businessLicenseUrl?: string;
  panNumber: string;
  ownerName: string;
  ownerIdDocumentUrl?: string;
  addressProofUrl?: string;
}

export interface SubmitKycDto {
  creatorKyc?: CreatorKycSubmissionDto;
  businessKyc?: BusinessKycSubmissionDto;
}

export interface ReviewKycDto {
  status: VerificationStatus.APPROVED | VerificationStatus.REJECTED | VerificationStatus.REQUIRES_INFO;
  notes?: string;
}

export interface KycRequestDto {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  entityName: string;
  verificationStatus: VerificationStatus;
  documents: {
    panNumber?: string | null;
    gstNumber?: string | null;
    idDocumentUrl?: string | null;
    gstCertificateUrl?: string | null;
    businessLicenseUrl?: string | null;
    ownerIdDocumentUrl?: string | null;
    addressProofUrl?: string | null;
    bankAccountHolderName?: string | null;
    bankAccountNumber?: string | null;
    bankIfsc?: string | null;
  };
  submittedAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  verificationNotes?: string | null;
}

export interface KycStatusResponse {
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  notes?: string | null;
  submittedAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  missingFields?: string[];
}
