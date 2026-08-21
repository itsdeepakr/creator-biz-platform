import { VerificationStatus } from './enums';

export interface BusinessProfileDto {
  id: string;
  userId: string;
  companyName: string;
  companyType: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string | null;
  verificationSubmittedAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  gstNumber?: string | null;
  gstCertificateUrl?: string | null;
  businessLicenseUrl?: string | null;
  panNumber?: string | null;
  ownerName?: string | null;
  ownerIdDocumentUrl?: string | null;
  addressProofUrl?: string | null;
  allowDirectInquiries: boolean;
  showInSearch: boolean;
  averageRating?: number;
  totalReviews?: number;
  activeCampaignsCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateBusinessProfileDto {
  companyName: string;
  companyType: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  allowDirectInquiries?: boolean;
}

export interface UpdateBusinessProfileDto {
  companyName?: string;
  companyType?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  allowDirectInquiries?: boolean;
  showInSearch?: boolean;
}

export interface BusinessFilterDto {
  industry?: string;
  city?: string;
  state?: string;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
