import axios, { AxiosInstance } from 'axios';
import {
  UserRole,
  VerificationStatus,
  CampaignStatus,
  DisputeStatus,
  DisputeOutcome,
  PaymentStatus,
  EscrowTransactionType,
  ReviewType,
  DeliverableType,
} from '@cbp/shared';

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cbp_admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Types for Admin API
export interface AdminDashboardMetrics {
  gmv: number;
  gmvGrowth: number;
  platformRevenue: number;
  revenueGrowth: number;
  activeCampaigns: number;
  campaignsGrowth: number;
  pendingDisputes: number;
  pendingKycCount: number;
  totalCreators: number;
  totalBusinesses: number;
  activeEscrowBalance: number;
}

export interface RevenueTrendPoint {
  date: string;
  gmv: number;
  platformFee: number;
  payouts: number;
}

export interface ActivityItem {
  id: string;
  type: 'VERIFICATION' | 'DISPUTE' | 'CAMPAIGN' | 'PAYMENT' | 'USER';
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
  targetId?: string;
}

export interface KycRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: UserRole;
  entityName: string;
  verificationStatus: VerificationStatus;
  documents: {
    panNumber?: string | null;
    gstNumber?: string | null;
    idDocumentUrl?: string | null;
    idDocumentType?: string | null;
    gstCertificateUrl?: string | null;
    businessLicenseUrl?: string | null;
    ownerIdDocumentUrl?: string | null;
    addressProofUrl?: string | null;
    bankAccountHolderName?: string | null;
    bankAccountNumber?: string | null;
    bankIfsc?: string | null;
  };
  panVerified?: boolean;
  gstVerified?: boolean;
  submittedAt: string;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
}

export interface DisputeRecord {
  id: string;
  collaborationId: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  contractAmount: number;
  escrowAmount: number;
  platformFeeAmount: number;
  initiatedBy: 'CREATOR' | 'BUSINESS';
  initiatorName: string;
  reason: string;
  category: string;
  status: DisputeStatus;
  outcome?: DisputeOutcome | null;
  creatorEvidence?: Array<{
    id: string;
    description: string;
    mediaUrls: string[];
    submittedAt: string;
  }>;
  businessEvidence?: Array<{
    id: string;
    description: string;
    mediaUrls: string[];
    submittedAt: string;
  }>;
  chatAuditLogs?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    timestamp: string;
    attachments?: string[];
  }>;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  amountRefunded?: number | null;
  amountReleased?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCampaignRecord {
  id: string;
  title: string;
  description: string;
  businessId: string;
  businessName: string;
  status: CampaignStatus;
  isFeatured: boolean;
  budgetMin: number;
  budgetMax: number;
  budgetCurrency: string;
  deliverableTypes: DeliverableType[];
  creatorCategories: string[];
  requiredPlatforms: string[];
  applicantCount: number;
  acceptedCount: number;
  createdAt: string;
  applicationDeadline?: string;
}

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  totalCollaborations: number;
  totalVolume: number;
  rating: number;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface EscrowLedgerRecord {
  id: string;
  paymentId: string;
  collaborationId: string;
  campaignTitle: string;
  businessName: string;
  creatorName: string;
  type: EscrowTransactionType;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  status: PaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
}

export interface AdminReviewRecord {
  id: string;
  collaborationId: string;
  campaignTitle: string;
  reviewerName: string;
  reviewerRole: string;
  revieweeName: string;
  revieweeRole: string;
  type: ReviewType;
  rating: number;
  comment: string;
  isPublic: boolean;
  isFlagged: boolean;
  createdAt: string;
}

export interface PlatformSettingsData {
  platformFeePercentage: number;
  minimumPayoutAmount: number;
  autoApproveKycThreshold: boolean;
  autoReleaseDaysAfterApproval: number;
  disputeResolutionWindowDays: number;
  razorpayEnabled: boolean;
  gstMandatoryForBusinesses: boolean;
  panMandatoryForPayouts: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
}

// Fallback Mock State for Zero-Backend Resilience
const mockDb = {
  metrics: {
    gmv: 18450000,
    gmvGrowth: 24.5,
    platformRevenue: 1845000,
    revenueGrowth: 26.2,
    activeCampaigns: 42,
    campaignsGrowth: 12.0,
    pendingDisputes: 3,
    pendingKycCount: 7,
    totalCreators: 3420,
    totalBusinesses: 580,
    activeEscrowBalance: 3650000,
  } as AdminDashboardMetrics,

  revenueTrends: [
    { date: '2026-03', gmv: 1250000, platformFee: 125000, payouts: 1125000 },
    { date: '2026-04', gmv: 1580000, platformFee: 158000, payouts: 1422000 },
    { date: '2026-05', gmv: 2100000, platformFee: 210000, payouts: 1890000 },
    { date: '2026-06', gmv: 2890000, platformFee: 289000, payouts: 2601000 },
    { date: '2026-07', gmv: 3450000, platformFee: 345000, payouts: 3105000 },
    { date: '2026-08', gmv: 4200000, platformFee: 420000, payouts: 3780000 },
  ] as RevenueTrendPoint[],

  activities: [
    {
      id: 'act-1',
      type: 'VERIFICATION' as const,
      title: 'New Creator KYC Submitted',
      description: 'Ananya Sharma (@ananya_creates) submitted PAN & Aadhaar documents.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      severity: 'info' as const,
      targetId: 'kyc-1',
    },
    {
      id: 'act-2',
      type: 'DISPUTE' as const,
      title: 'Dispute Raised for Festive Glow Campaign',
      description: 'Organic Glow India reported non-delivery of Instagram Reel.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      severity: 'warning' as const,
      targetId: 'disp-1',
    },
    {
      id: 'act-3',
      type: 'PAYMENT' as const,
      title: 'Escrow Released ₹75,000',
      description: 'Settlement completed for FitLife Protein Campaign to Rohan Verma.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      severity: 'success' as const,
      targetId: 'pay-1',
    },
    {
      id: 'act-4',
      type: 'CAMPAIGN' as const,
      title: 'High-Budget Campaign Published',
      description: 'TechPulse India launched "NextGen Flagship Launch" with budget ₹2,50,000.',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      severity: 'info' as const,
      targetId: 'camp-1',
    },
  ] as ActivityItem[],

  kycQueue: [
    {
      id: 'kyc-1',
      userId: 'usr-cr-101',
      userEmail: 'ananya.sharma@example.com',
      userName: 'Ananya Sharma',
      userRole: UserRole.CREATOR,
      entityName: 'Ananya Lifestyle & Tech',
      verificationStatus: VerificationStatus.PENDING,
      documents: {
        panNumber: 'ABCPS1234F',
        idDocumentType: 'AADHAAR',
        idDocumentUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        bankAccountHolderName: 'Ananya Sharma',
        bankAccountNumber: '987654321012',
        bankIfsc: 'HDFC0001234',
      },
      panVerified: true,
      submittedAt: '2026-08-20T10:30:00Z',
    },
    {
      id: 'kyc-2',
      userId: 'usr-bz-201',
      userEmail: 'finance@bombaychai.co',
      userName: 'Vikram Mehta',
      userRole: UserRole.BUSINESS,
      entityName: 'Bombay Chai Beverages Pvt Ltd',
      verificationStatus: VerificationStatus.UNDER_REVIEW,
      documents: {
        panNumber: 'AABCB9876G',
        gstNumber: '27AABCB9876G1Z5',
        gstCertificateUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
        businessLicenseUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80',
        ownerIdDocumentUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        addressProofUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
      },
      panVerified: true,
      gstVerified: true,
      submittedAt: '2026-08-19T14:15:00Z',
    },
    {
      id: 'kyc-3',
      userId: 'usr-cr-102',
      userEmail: 'kabir.singh@creator.in',
      userName: 'Kabir Singh',
      userRole: UserRole.CREATOR,
      entityName: 'Kabir Gaming',
      verificationStatus: VerificationStatus.REQUIRES_INFO,
      documents: {
        panNumber: 'BLAPS4321K',
        idDocumentType: 'PASSPORT',
        idDocumentUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&q=80',
        bankAccountHolderName: 'Kabir Singh',
        bankAccountNumber: '123456789012',
        bankIfsc: 'SBIN0005678',
      },
      panVerified: false,
      verificationNotes: 'PAN card image was blurry. Please re-upload a clear government ID scan.',
      submittedAt: '2026-08-18T09:00:00Z',
    },
    {
      id: 'kyc-4',
      userId: 'usr-bz-202',
      userEmail: 'partnerships@zestyfoods.in',
      userName: 'Pooja Hegde',
      userRole: UserRole.BUSINESS,
      entityName: 'Zesty Foods India LLP',
      verificationStatus: VerificationStatus.VERIFIED,
      documents: {
        panNumber: 'AAACZ5678L',
        gstNumber: '29AAACZ5678L1ZB',
        gstCertificateUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&q=80',
      },
      panVerified: true,
      gstVerified: true,
      submittedAt: '2026-08-15T11:20:00Z',
      verifiedAt: '2026-08-16T10:00:00Z',
      verificationNotes: 'Verified via GSTIN & PAN NSDL database.',
    },
  ] as KycRecord[],

  disputes: [
    {
      id: 'disp-1',
      collaborationId: 'collab-101',
      campaignId: 'camp-1',
      campaignTitle: 'Summer Organic Skincare Launch',
      creatorId: 'usr-cr-101',
      creatorName: 'Ananya Sharma',
      businessId: 'usr-bz-201',
      businessName: 'Organic Glow India',
      contractAmount: 50000,
      escrowAmount: 50000,
      platformFeeAmount: 5000,
      initiatedBy: 'BUSINESS' as const,
      initiatorName: 'Organic Glow India',
      reason: 'Deliverable video did not include mandatory product hashtag and discount code as specified in brief.',
      category: 'Brief Non-Compliance',
      status: DisputeStatus.OPEN,
      creatorEvidence: [
        {
          id: 'ev-cr-1',
          description: 'Added hashtag #OrganicGlow in pinned comment as Instagram caption limit was exceeded. Offered 2 free revisions.',
          mediaUrls: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'],
          submittedAt: '2026-08-20T12:00:00Z',
        },
      ],
      businessEvidence: [
        {
          id: 'ev-bz-1',
          description: 'Campaign brief explicitly required discount code GLOW20 in video overlay and first 3 lines of caption.',
          mediaUrls: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80'],
          submittedAt: '2026-08-20T11:00:00Z',
        },
      ],
      chatAuditLogs: [
        {
          id: 'msg-1',
          senderId: 'usr-bz-201',
          senderName: 'Organic Glow',
          senderRole: 'BUSINESS',
          content: 'Hi Ananya, please ensure the code GLOW20 is pinned on screen for 5 seconds.',
          timestamp: '2026-08-17T10:00:00Z',
        },
        {
          id: 'msg-2',
          senderId: 'usr-cr-101',
          senderName: 'Ananya Sharma',
          senderRole: 'CREATOR',
          content: 'Understood! I will include the overlay in the final cut.',
          timestamp: '2026-08-17T10:30:00Z',
        },
        {
          id: 'msg-3',
          senderId: 'usr-cr-101',
          senderName: 'Ananya Sharma',
          senderRole: 'CREATOR',
          content: 'Uploaded draft reel! Link is in deliverables.',
          timestamp: '2026-08-19T16:00:00Z',
        },
        {
          id: 'msg-4',
          senderId: 'usr-bz-201',
          senderName: 'Organic Glow',
          senderRole: 'BUSINESS',
          content: 'The code is missing from the reel entirely. We requested revision but got no response for 24h.',
          timestamp: '2026-08-20T09:00:00Z',
        },
      ],
      createdAt: '2026-08-20T11:00:00Z',
      updatedAt: '2026-08-20T12:00:00Z',
    },
    {
      id: 'disp-2',
      collaborationId: 'collab-102',
      campaignId: 'camp-2',
      campaignTitle: 'Fitness Smartwatch Unboxing & Review',
      creatorId: 'usr-cr-103',
      creatorName: 'Rohan Verma',
      businessId: 'usr-bz-203',
      businessName: 'PulseTech Gadgets',
      contractAmount: 80000,
      escrowAmount: 80000,
      platformFeeAmount: 8000,
      initiatedBy: 'CREATOR' as const,
      initiatorName: 'Rohan Verma',
      reason: 'Brand refused deliverable approval after 3 rounds of minor revisions exceeding contract limit of 1 revision.',
      category: 'Excessive Revision Requests',
      status: DisputeStatus.UNDER_REVIEW,
      creatorEvidence: [
        {
          id: 'ev-cr-2',
          description: 'Provided initial video + 3 requested edits. Brand is now asking for a complete reshoot in different location.',
          mediaUrls: ['https://images.unsplash.com/photo-1510519138197-04b824057966?w=800&q=80'],
          submittedAt: '2026-08-19T15:00:00Z',
        },
      ],
      businessEvidence: [],
      chatAuditLogs: [
        {
          id: 'msg-5',
          senderId: 'usr-bz-203',
          senderName: 'PulseTech Gadgets',
          senderRole: 'BUSINESS',
          content: 'We need the background to be a gym setting, not your living room.',
          timestamp: '2026-08-18T14:00:00Z',
        },
      ],
      createdAt: '2026-08-19T14:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    },
  ] as DisputeRecord[],

  campaigns: [
    {
      id: 'camp-1',
      title: 'Summer Organic Skincare Launch',
      description: 'Promote our all-natural turmeric & aloe vera serum range for glowing summer skin.',
      businessId: 'usr-bz-201',
      businessName: 'Organic Glow India',
      status: CampaignStatus.ACTIVE,
      isFeatured: true,
      budgetMin: 30000,
      budgetMax: 60000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.INSTAGRAM_STORY],
      creatorCategories: ['Beauty', 'Skincare', 'Lifestyle'],
      requiredPlatforms: ['Instagram'],
      applicantCount: 28,
      acceptedCount: 3,
      createdAt: '2026-08-01T10:00:00Z',
      applicationDeadline: '2026-08-25T23:59:59Z',
    },
    {
      id: 'camp-2',
      title: 'Fitness Smartwatch Unboxing & Review',
      description: 'Comprehensive review and athletic feature testing of our waterproof fitness tracker.',
      businessId: 'usr-bz-203',
      businessName: 'PulseTech Gadgets',
      status: CampaignStatus.ACTIVE,
      isFeatured: true,
      budgetMin: 50000,
      budgetMax: 100000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.YOUTUBE_VIDEO, DeliverableType.INSTAGRAM_REEL],
      creatorCategories: ['Fitness', 'Tech', 'Health'],
      requiredPlatforms: ['YouTube', 'Instagram'],
      applicantCount: 45,
      acceptedCount: 5,
      createdAt: '2026-08-05T14:00:00Z',
      applicationDeadline: '2026-08-28T23:59:59Z',
    },
    {
      id: 'camp-3',
      title: 'Traditional Masala Chai Festive Gift Box',
      description: 'Authentic Indian chai blend celebration campaign for upcoming Diwali festive season.',
      businessId: 'usr-bz-201',
      businessName: 'Bombay Chai Beverages',
      status: CampaignStatus.IN_REVIEW,
      isFeatured: false,
      budgetMin: 20000,
      budgetMax: 40000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      creatorCategories: ['Food & Beverage', 'Cooking', 'Lifestyle'],
      requiredPlatforms: ['Instagram'],
      applicantCount: 12,
      acceptedCount: 0,
      createdAt: '2026-08-18T16:00:00Z',
      applicationDeadline: '2026-09-10T23:59:59Z',
    },
    {
      id: 'camp-4',
      title: 'Crypto & Forex Trading Bot Masterclass',
      description: 'Guaranteed 500% returns with algorithmic trading app.',
      businessId: 'usr-bz-999',
      businessName: 'Apex Wealth Crypto',
      status: CampaignStatus.PAUSED,
      isFeatured: false,
      budgetMin: 100000,
      budgetMax: 250000,
      budgetCurrency: 'INR',
      deliverableTypes: [DeliverableType.YOUTUBE_VIDEO],
      creatorCategories: ['Finance'],
      requiredPlatforms: ['YouTube'],
      applicantCount: 4,
      acceptedCount: 0,
      createdAt: '2026-08-17T11:00:00Z',
      applicationDeadline: '2026-08-30T23:59:59Z',
    },
  ] as AdminCampaignRecord[],

  users: [
    {
      id: 'usr-admin-1',
      email: 'admin@cbp.platform',
      name: 'Super Admin',
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
      status: 'ACTIVE' as const,
      totalCollaborations: 0,
      totalVolume: 0,
      rating: 5.0,
      createdAt: '2026-01-01T00:00:00Z',
      lastLoginAt: '2026-08-21T08:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    },
    {
      id: 'usr-cr-101',
      email: 'ananya.sharma@example.com',
      name: 'Ananya Sharma',
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: true,
      status: 'ACTIVE' as const,
      totalCollaborations: 24,
      totalVolume: 680000,
      rating: 4.85,
      createdAt: '2026-02-14T10:00:00Z',
      lastLoginAt: '2026-08-21T11:30:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    },
    {
      id: 'usr-bz-201',
      email: 'finance@bombaychai.co',
      name: 'Bombay Chai Beverages Pvt Ltd',
      role: UserRole.BUSINESS,
      isActive: true,
      isVerified: true,
      status: 'ACTIVE' as const,
      totalCollaborations: 18,
      totalVolume: 920000,
      rating: 4.9,
      createdAt: '2026-02-20T12:00:00Z',
      lastLoginAt: '2026-08-21T09:45:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
    },
    {
      id: 'usr-cr-103',
      email: 'rohan.fit@creator.in',
      name: 'Rohan Verma',
      role: UserRole.CREATOR,
      isActive: true,
      isVerified: true,
      status: 'ACTIVE' as const,
      totalCollaborations: 15,
      totalVolume: 520000,
      rating: 4.7,
      createdAt: '2026-03-01T15:00:00Z',
      lastLoginAt: '2026-08-20T18:20:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    },
    {
      id: 'usr-bz-999',
      email: 'contact@apexwealthcrypto.fake',
      name: 'Apex Wealth Crypto',
      role: UserRole.BUSINESS,
      isActive: false,
      isVerified: false,
      status: 'SUSPENDED' as const,
      totalCollaborations: 1,
      totalVolume: 0,
      rating: 1.0,
      createdAt: '2026-08-16T10:00:00Z',
      lastLoginAt: '2026-08-17T11:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    },
  ] as AdminUserRecord[],

  payments: [
    {
      id: 'pay-1',
      paymentId: 'pay_rzp_897162819',
      collaborationId: 'collab-100',
      campaignTitle: 'FitLife Protein Powder Launch',
      businessName: 'FitLife Nutrition',
      creatorName: 'Rohan Verma',
      type: EscrowTransactionType.RELEASE,
      grossAmount: 75000,
      platformFee: 7500,
      netPayout: 67500,
      status: PaymentStatus.RELEASED,
      razorpayPaymentId: 'pay_Nq98H3892716',
      razorpayOrderId: 'order_Nq98H3892716',
      createdAt: '2026-08-20T14:30:00Z',
    },
    {
      id: 'pay-2',
      paymentId: 'pay_rzp_982371921',
      collaborationId: 'collab-101',
      campaignTitle: 'Summer Organic Skincare Launch',
      businessName: 'Organic Glow India',
      creatorName: 'Ananya Sharma',
      type: EscrowTransactionType.FUND,
      grossAmount: 50000,
      platformFee: 5000,
      netPayout: 45000,
      status: PaymentStatus.ESCROW_HELD,
      razorpayPaymentId: 'pay_Op837192019',
      razorpayOrderId: 'order_Op837192019',
      createdAt: '2026-08-18T10:15:00Z',
    },
    {
      id: 'pay-3',
      paymentId: 'pay_rzp_776192831',
      collaborationId: 'collab-102',
      campaignTitle: 'Fitness Smartwatch Unboxing & Review',
      businessName: 'PulseTech Gadgets',
      creatorName: 'Rohan Verma',
      type: EscrowTransactionType.FUND,
      grossAmount: 80000,
      platformFee: 8000,
      netPayout: 72000,
      status: PaymentStatus.ESCROW_HELD,
      razorpayPaymentId: 'pay_Kl281903819',
      razorpayOrderId: 'order_Kl281903819',
      createdAt: '2026-08-17T16:45:00Z',
    },
    {
      id: 'pay-4',
      paymentId: 'pay_rzp_661928371',
      collaborationId: 'collab-99',
      campaignTitle: 'Monsoon Chai Fest Promo',
      businessName: 'Bombay Chai Beverages',
      creatorName: 'Kabir Singh',
      type: EscrowTransactionType.REFUND,
      grossAmount: 30000,
      platformFee: 0,
      netPayout: 0,
      status: PaymentStatus.REFUNDED,
      razorpayPaymentId: 'pay_Zx918273615',
      razorpayOrderId: 'order_Zx918273615',
      createdAt: '2026-08-14T11:00:00Z',
    },
  ] as EscrowLedgerRecord[],

  reviews: [
    {
      id: 'rev-1',
      collaborationId: 'collab-100',
      campaignTitle: 'FitLife Protein Powder Launch',
      reviewerName: 'FitLife Nutrition',
      reviewerRole: 'BUSINESS',
      revieweeName: 'Rohan Verma',
      revieweeRole: 'CREATOR',
      type: ReviewType.BUSINESS_TO_CREATOR,
      rating: 5,
      comment: 'Exceptional content quality! Rohan delivered well before the deadline and the reel received 120k organic views.',
      isPublic: true,
      isFlagged: false,
      createdAt: '2026-08-20T16:00:00Z',
    },
    {
      id: 'rev-2',
      collaborationId: 'collab-99',
      campaignTitle: 'Monsoon Chai Fest Promo',
      reviewerName: 'Kabir Singh',
      reviewerRole: 'CREATOR',
      revieweeName: 'Bombay Chai Beverages',
      revieweeRole: 'BUSINESS',
      type: ReviewType.CREATOR_TO_BUSINESS,
      rating: 2,
      comment: 'Brand kept changing deliverables halfway through and delayed brief confirmation.',
      isPublic: true,
      isFlagged: true,
      createdAt: '2026-08-15T09:30:00Z',
    },
  ] as AdminReviewRecord[],

  settings: {
    platformFeePercentage: 10,
    minimumPayoutAmount: 1000,
    autoApproveKycThreshold: false,
    autoReleaseDaysAfterApproval: 3,
    disputeResolutionWindowDays: 7,
    razorpayEnabled: true,
    gstMandatoryForBusinesses: true,
    panMandatoryForPayouts: true,
    maintenanceMode: false,
    supportEmail: 'support@cbp.platform',
  } as PlatformSettingsData,
};

// Admin API Services
export const adminApi = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    } catch {
      // Fallback auth for admin portal preview & demo
      if (credentials.email === 'admin@cbp.platform' || credentials.email.includes('admin')) {
        const dummyToken = 'mock_jwt_admin_token_' + Date.now();
        const adminUser = mockDb.users[0];
        return {
          accessToken: dummyToken,
          refreshToken: 'mock_refresh_token',
          user: adminUser,
        };
      }
      throw new Error('Invalid credentials. Use admin@cbp.platform / Admin@12345');
    }
  },

  async getMe() {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch {
      return mockDb.users[0];
    }
  },

  // Dashboard & Metrics
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    try {
      const res = await api.get('/admin/metrics');
      return res.data;
    } catch {
      return mockDb.metrics;
    }
  },

  async getRevenueTrends(): Promise<RevenueTrendPoint[]> {
    try {
      const res = await api.get('/admin/metrics/revenue-trends');
      return res.data;
    } catch {
      return mockDb.revenueTrends;
    }
  },

  async getRecentActivities(): Promise<ActivityItem[]> {
    try {
      const res = await api.get('/admin/activities');
      return res.data;
    } catch {
      return mockDb.activities;
    }
  },

  // Verifications & KYC
  async getKycQueue(statusFilter?: string): Promise<KycRecord[]> {
    try {
      const res = await api.get('/admin/kyc/queue', { params: { status: statusFilter } });
      return res.data;
    } catch {
      if (!statusFilter || statusFilter === 'ALL') return [...mockDb.kycQueue];
      return mockDb.kycQueue.filter((k) => k.verificationStatus === statusFilter);
    }
  },

  async reviewKyc(id: string, decision: { status: VerificationStatus; notes?: string }): Promise<KycRecord> {
    try {
      const res = await api.post(`/admin/kyc/${id}/review`, decision);
      return res.data;
    } catch {
      const record = mockDb.kycQueue.find((k) => k.id === id);
      if (record) {
        record.verificationStatus = decision.status;
        record.verificationNotes = decision.notes || null;
        if (decision.status === VerificationStatus.APPROVED || decision.status === VerificationStatus.VERIFIED) {
          record.verifiedAt = new Date().toISOString();
        }
        return { ...record };
      }
      throw new Error('KYC record not found');
    }
  },

  // Disputes & Adjudication
  async getDisputes(statusFilter?: string): Promise<DisputeRecord[]> {
    try {
      const res = await api.get('/admin/disputes', { params: { status: statusFilter } });
      return res.data;
    } catch {
      if (!statusFilter || statusFilter === 'ALL') return [...mockDb.disputes];
      return mockDb.disputes.filter((d) => d.status === statusFilter);
    }
  },

  async getDisputeById(id: string): Promise<DisputeRecord> {
    try {
      const res = await api.get(`/admin/disputes/${id}`);
      return res.data;
    } catch {
      const dispute = mockDb.disputes.find((d) => d.id === id);
      if (dispute) return { ...dispute };
      throw new Error(`Dispute ${id} not found`);
    }
  },

  async resolveDispute(
    id: string,
    settlement: {
      outcome: DisputeOutcome;
      resolutionNotes: string;
      amountRefunded?: number;
      amountReleased?: number;
    }
  ): Promise<DisputeRecord> {
    try {
      const res = await api.post(`/admin/disputes/${id}/resolve`, settlement);
      return res.data;
    } catch {
      const dispute = mockDb.disputes.find((d) => d.id === id);
      if (dispute) {
        dispute.outcome = settlement.outcome;
        dispute.resolutionNotes = settlement.resolutionNotes;
        dispute.amountRefunded = settlement.amountRefunded || 0;
        dispute.amountReleased = settlement.amountReleased || 0;
        dispute.status =
          settlement.outcome === DisputeOutcome.PAYOUT_CREATOR
            ? DisputeStatus.RESOLVED_CREATOR
            : settlement.outcome === DisputeOutcome.REFUND_BUSINESS
            ? DisputeStatus.RESOLVED_BUSINESS
            : settlement.outcome === DisputeOutcome.PARTIAL_BOTH
            ? DisputeStatus.RESOLVED_SPLIT
            : DisputeStatus.RESOLVED;
        dispute.resolvedAt = new Date().toISOString();
        return { ...dispute };
      }
      throw new Error('Dispute not found');
    }
  },

  // Campaigns Moderation
  async getCampaigns(filter?: { status?: string; search?: string }): Promise<AdminCampaignRecord[]> {
    try {
      const res = await api.get('/admin/campaigns', { params: filter });
      return res.data;
    } catch {
      let list = [...mockDb.campaigns];
      if (filter?.status && filter.status !== 'ALL') {
        list = list.filter((c) => c.status === filter.status);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        list = list.filter((c) => c.title.toLowerCase().includes(q) || c.businessName.toLowerCase().includes(q));
      }
      return list;
    }
  },

  async toggleCampaignFeatured(id: string): Promise<AdminCampaignRecord> {
    try {
      const res = await api.patch(`/admin/campaigns/${id}/featured`);
      return res.data;
    } catch {
      const camp = mockDb.campaigns.find((c) => c.id === id);
      if (camp) {
        camp.isFeatured = !camp.isFeatured;
        return { ...camp };
      }
      throw new Error('Campaign not found');
    }
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<AdminCampaignRecord> {
    try {
      const res = await api.patch(`/admin/campaigns/${id}/status`, { status });
      return res.data;
    } catch {
      const camp = mockDb.campaigns.find((c) => c.id === id);
      if (camp) {
        camp.status = status;
        return { ...camp };
      }
      throw new Error('Campaign not found');
    }
  },

  // Users Directory & Moderation
  async getUsers(filter?: { role?: string; search?: string; status?: string }): Promise<AdminUserRecord[]> {
    try {
      const res = await api.get('/admin/users', { params: filter });
      return res.data;
    } catch {
      let list = [...mockDb.users];
      if (filter?.role && filter.role !== 'ALL') {
        list = list.filter((u) => u.role === filter.role);
      }
      if (filter?.status && filter.status !== 'ALL') {
        list = list.filter((u) => u.status === filter.status);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return list;
    }
  },

  async updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'): Promise<AdminUserRecord> {
    try {
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      return res.data;
    } catch {
      const user = mockDb.users.find((u) => u.id === id);
      if (user) {
        user.status = status;
        user.isActive = status === 'ACTIVE';
        return { ...user };
      }
      throw new Error('User not found');
    }
  },

  // Payments & Escrow Ledger
  async getPayments(filter?: { status?: string; search?: string }): Promise<EscrowLedgerRecord[]> {
    try {
      const res = await api.get('/admin/payments', { params: filter });
      return res.data;
    } catch {
      let list = [...mockDb.payments];
      if (filter?.status && filter.status !== 'ALL') {
        list = list.filter((p) => p.status === filter.status);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.campaignTitle.toLowerCase().includes(q) ||
            p.businessName.toLowerCase().includes(q) ||
            p.creatorName.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  // Reviews Moderation
  async getReviews(filter?: { flaggedOnly?: boolean; search?: string }): Promise<AdminReviewRecord[]> {
    try {
      const res = await api.get('/admin/reviews', { params: filter });
      return res.data;
    } catch {
      let list = [...mockDb.reviews];
      if (filter?.flaggedOnly) {
        list = list.filter((r) => r.isFlagged);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.comment.toLowerCase().includes(q) ||
            r.reviewerName.toLowerCase().includes(q) ||
            r.revieweeName.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  async toggleReviewVisibility(id: string): Promise<AdminReviewRecord> {
    try {
      const res = await api.patch(`/admin/reviews/${id}/visibility`);
      return res.data;
    } catch {
      const rev = mockDb.reviews.find((r) => r.id === id);
      if (rev) {
        rev.isPublic = !rev.isPublic;
        return { ...rev };
      }
      throw new Error('Review not found');
    }
  },

  async deleteReview(id: string): Promise<{ success: boolean }> {
    try {
      await api.delete(`/admin/reviews/${id}`);
      return { success: true };
    } catch {
      const index = mockDb.reviews.findIndex((r) => r.id === id);
      if (index >= 0) {
        mockDb.reviews.splice(index, 1);
        return { success: true };
      }
      throw new Error('Review not found');
    }
  },

  // Platform Settings
  async getSettings(): Promise<PlatformSettingsData> {
    try {
      const res = await api.get('/admin/settings');
      return res.data;
    } catch {
      return { ...mockDb.settings };
    }
  },

  async updateSettings(data: Partial<PlatformSettingsData>): Promise<PlatformSettingsData> {
    try {
      const res = await api.put('/admin/settings', data);
      return res.data;
    } catch {
      mockDb.settings = { ...mockDb.settings, ...data };
      return { ...mockDb.settings };
    }
  },
};
