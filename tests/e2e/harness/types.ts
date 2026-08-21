/**
 * E2E Test Harness Types & Contracts
 * Uses const objects + type aliases for 100% compatibility across Node TS strip-types and TypeScript compiler.
 */

export const UserRole = {
  ADMIN: 'ADMIN',
  BUSINESS: 'BUSINESS',
  CREATOR: 'CREATOR',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const VerificationStatus = {
  UNSUBMITTED: 'UNSUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REQUIRES_INFO: 'REQUIRES_INFO',
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  IN_REVIEW: 'IN_REVIEW',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
} as const;
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const BudgetType = {
  FIXED: 'FIXED',
  RANGE: 'RANGE',
  NEGOTIABLE: 'NEGOTIABLE',
} as const;
export type BudgetType = (typeof BudgetType)[keyof typeof BudgetType];

export const DeliverableType = {
  INSTAGRAM_REEL: 'INSTAGRAM_REEL',
  INSTAGRAM_STORY: 'INSTAGRAM_STORY',
  INSTAGRAM_POST: 'INSTAGRAM_POST',
  YOUTUBE_VIDEO: 'YOUTUBE_VIDEO',
  YOUTUBE_SHORTS: 'YOUTUBE_SHORTS',
} as const;
export type DeliverableType = (typeof DeliverableType)[keyof typeof DeliverableType];

export const BidStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
  COUNTERED: 'COUNTERED',
} as const;
export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus];

export const CollaborationStatus = {
  PENDING: 'PENDING',
  NEGOTIATING: 'NEGOTIATING',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DELIVERABLE_SUBMITTED: 'DELIVERABLE_SUBMITTED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  APPROVED: 'APPROVED',
  PENDING_PAYOUT: 'PENDING_PAYOUT',
  PAID_OUT: 'PAID_OUT',
  DISPUTED: 'DISPUTED',
  RESOLVED_BUSINESS: 'RESOLVED_BUSINESS',
  RESOLVED_CREATOR: 'RESOLVED_CREATOR',
  RESOLVED_PARTIAL: 'RESOLVED_PARTIAL',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
} as const;
export type CollaborationStatus = (typeof CollaborationStatus)[keyof typeof CollaborationStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  ESCROW_HELD: 'ESCROW_HELD',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  FAILED: 'FAILED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED_BUSINESS: 'RESOLVED_BUSINESS',
  RESOLVED_CREATOR: 'RESOLVED_CREATOR',
  RESOLVED_PARTIAL: 'RESOLVED_PARTIAL',
  RESOLVED_SPLIT: 'RESOLVED_SPLIT',
  REJECTED: 'REJECTED',
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

export const DisputeResolution = {
  BUSINESS: 'BUSINESS',
  CREATOR: 'CREATOR',
  PARTIAL: 'PARTIAL',
} as const;
export type DisputeResolution = (typeof DisputeResolution)[keyof typeof DisputeResolution];

export interface UserRecord {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  displayName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatorProfileRecord {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  category: string;
  subCategories: string[];
  location: string;
  languages: string[];
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  hourlyRate?: number;
  minProjectBudget?: number;
  panNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolderName?: string;
  idDocumentUrl?: string;
  idDocumentType?: string;
  kycStatus: VerificationStatus;
  socialStats?: {
    instagramFollowers?: number;
    instagramEngagement?: number;
    youtubeSubscribers?: number;
    youtubeAvgViews?: number;
  };
  socialStatsRefreshedAt?: Date;
}

export interface BusinessProfileRecord {
  id: string;
  userId: string;
  companyName: string;
  companyType: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry: string;
  address?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  verificationStatus: VerificationStatus;
  gstNumber?: string;
  gstCertificateUrl?: string;
  businessLicenseUrl?: string;
  panNumber?: string;
  ownerName?: string;
  ownerIdDocumentUrl?: string;
  addressProofUrl?: string;
  allowDirectInquiries: boolean;
  showInSearch: boolean;
}

export interface CampaignRecord {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: CampaignStatus;
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  deliverableTypes: DeliverableType[];
  deliverableDetails?: Record<string, any>;
  creatorCount: number;
  creatorCategories: string[];
  requiredPlatforms: string[];
  requiredLocation?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  startDate?: Date;
  endDate?: Date;
  applicationDeadline?: Date;
  autoCloseAfterHire: boolean;
  allowNegotiation: boolean;
  maxRevisions: number;
  autoApproveAfterDays: number;
  platformFeePercent: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverableSubmission {
  type: DeliverableType;
  url: string;
  submittedAt: Date;
  notes?: string;
}

export interface CollaborationRecord {
  id: string;
  campaignId: string;
  creatorId: string;
  businessId: string;
  offeredAmount: number;
  negotiatedAmount?: number;
  agreedAmount?: number;
  bidMessage?: string;
  counterOfferAmount?: number;
  counterOfferMessage?: string;
  counterOfferBy?: string;
  status: CollaborationStatus;
  deliverableLinks: DeliverableSubmission[];
  revisionCount: number;
  maxRevisions: number;
  revisionRequest?: string;
  approvalNotes?: string;
  appliedAt: Date;
  offeredAt?: Date;
  acceptedAt?: Date;
  inProgressAt?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  autoApproveAt?: Date;
  revisionDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  collaborationId: string;
  businessId: string;
  creatorId: string;
  grossAmount: number;
  platformFeeAmount: number;
  platformFeePercent: number;
  netAmountToCreator: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpayReleaseId?: string;
  escrowStatus: PaymentStatus;
  gatewayResponse?: any;
  releasedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeRecord {
  id: string;
  campaignId: string;
  collaborationId: string;
  raisedBy: string;
  againstUserId: string;
  category: string;
  reason: string;
  status: DisputeStatus;
  creatorEvidence?: string[];
  businessEvidence?: string[];
  resolutionNotes?: string;
  resolvedBy?: string;
  refundAmount?: number;
  payoutAmount?: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewRecord {
  id: string;
  collaborationId: string;
  reviewerId: string;
  revieweeId: string;
  type: 'BUSINESS_TO_CREATOR' | 'CREATOR_TO_BUSINESS';
  overallRating: number;
  criteriaRatings: Record<string, number>;
  comment: string;
  isPublic: boolean;
  businessResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatThreadRecord {
  id: string;
  creatorId: string;
  businessId: string;
  campaignId?: string;
  collaborationId?: string;
  isActive: boolean;
  closedAt?: Date;
  offPlatformContactDetected: boolean;
  warningCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageRecord {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM';
  mediaUrls: string[];
  isFlagged: boolean;
  flagReason?: string;
  isDeleted: boolean;
  createdAt: Date;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: string[];
  readAt?: Date;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}
