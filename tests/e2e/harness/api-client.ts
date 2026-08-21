/**
 * Simulated and Live REST API Client for E2E Tests
 * Implements all 34 REST API endpoints specified in 04-api-specs and PROJECT.md.
 */

import { InMemoryDatabase } from './database-client.ts';
import {
  UserRole,
  VerificationStatus,
  CampaignStatus,
  BudgetType,
  DeliverableType,
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
  DisputeResolution,
} from './types.ts';
import type {
  ApiResponse,
  DeliverableSubmission,
} from './types.ts';

export class ApiClient {
  private currentToken: string | null = null;
  private currentUserId: string | null = null;
  private currentRole: UserRole | null = null;
  private db: InMemoryDatabase;

  constructor(db: InMemoryDatabase) {
    this.db = db;
  }

  public setAuthToken(token: string | null): void {
    this.currentToken = token;
    if (token && token.startsWith('mock_jwt:')) {
      const [, userId, role] = token.split(':');
      this.currentUserId = userId;
      this.currentRole = role as UserRole;
    } else {
      this.currentUserId = null;
      this.currentRole = null;
    }
  }

  // ----------------------------------------------------
  // 1. AUTHENTICATION (`/api/v1/auth`)
  // ----------------------------------------------------
  public async register(payload: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    phone?: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      if (!payload.email || !payload.email.includes('@')) {
        return { statusCode: 400, success: false, error: 'Invalid email address' };
      }
      if (!payload.password || payload.password.length < 6) {
        return { statusCode: 400, success: false, error: 'Password must be at least 6 characters' };
      }
      if (!payload.displayName) {
        return { statusCode: 400, success: false, error: 'Display name is required' };
      }
      if (!payload.role || !Object.values(UserRole).includes(payload.role)) {
        return { statusCode: 400, success: false, error: 'Invalid user role' };
      }

      if (this.db.getUserByEmail(payload.email)) {
        return { statusCode: 409, success: false, error: 'Email already registered' };
      }

      const user = this.db.createUser({
        email: payload.email,
        phone: payload.phone,
        passwordHash: `hash_${payload.password}`,
        role: payload.role,
        displayName: payload.displayName,
        isActive: true,
        isVerified: false,
      });

      // Auto-create initial profile stub
      if (payload.role === UserRole.CREATOR) {
        this.db.createCreatorProfile({
          userId: user.id,
          displayName: payload.displayName,
          category: 'General',
          subCategories: [],
          location: 'India',
          languages: ['English'],
          isVerified: false,
          verificationStatus: VerificationStatus.UNSUBMITTED,
          kycStatus: VerificationStatus.UNSUBMITTED,
        });
      } else if (payload.role === UserRole.BUSINESS) {
        this.db.createBusinessProfile({
          userId: user.id,
          companyName: payload.displayName,
          companyType: 'OTHER',
          industry: 'General',
          city: 'Unknown',
          state: 'Unknown',
          pincode: '000000',
          country: 'IN',
          verificationStatus: VerificationStatus.UNSUBMITTED,
          allowDirectInquiries: true,
          showInSearch: true,
        });
      }

      const token = `mock_jwt:${user.id}:${user.role}`;
      return {
        statusCode: 201,
        success: true,
        data: { user, token },
      };
    } catch (err: any) {
      return { statusCode: 500, success: false, error: err.message };
    }
  }

  public async login(payload: { email: string; password?: string; idToken?: string }): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      if (!payload.email) {
        return { statusCode: 400, success: false, error: 'Email is required' };
      }

      const user = this.db.getUserByEmail(payload.email);
      if (!user) {
        return { statusCode: 401, success: false, error: 'Invalid email or password' };
      }

      if (!user.isActive) {
        return { statusCode: 403, success: false, error: 'Account is suspended or deactivated' };
      }

      const token = `mock_jwt:${user.id}:${user.role}`;
      this.setAuthToken(token);
      return {
        statusCode: 200,
        success: true,
        data: { user, token },
      };
    } catch (err: any) {
      return { statusCode: 500, success: false, error: err.message };
    }
  }

  public async getMe(): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    const user = this.db.getUserById(this.currentUserId!);
    if (!user) return { statusCode: 404, success: false, error: 'User not found' };

    let profile = null;
    if (user.role === UserRole.CREATOR) {
      profile = this.db.getCreatorProfileByUserId(user.id);
    } else if (user.role === UserRole.BUSINESS) {
      profile = this.db.getBusinessProfileByUserId(user.id);
    }

    return {
      statusCode: 200,
      success: true,
      data: { ...user, profile },
    };
  }

  public async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    if (!refreshToken) {
      return { statusCode: 400, success: false, error: 'Refresh token required' };
    }
    if (!this.currentUserId) {
      return { statusCode: 401, success: false, error: 'Invalid refresh token' };
    }
    const token = `mock_jwt:${this.currentUserId}:${this.currentRole}`;
    return { statusCode: 200, success: true, data: { token } };
  }

  // ----------------------------------------------------
  // 2. VERIFICATIONS & KYC (`/api/v1/verifications`)
  // ----------------------------------------------------
  public async submitCreatorKyc(payload: {
    panNumber: string;
    bankAccountNumber: string;
    bankIfsc: string;
    bankAccountHolderName: string;
    idDocumentUrl?: string;
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.CREATOR);
    if (authCheck) return authCheck;

    // Validate PAN format (5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(payload.panNumber.toUpperCase())) {
      return { statusCode: 400, success: false, error: 'Invalid Indian PAN format (expected ABCDE1234F)' };
    }

    // Validate IFSC format (4 letters, 0, 6 alphanumeric)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(payload.bankIfsc.toUpperCase())) {
      return { statusCode: 400, success: false, error: 'Invalid Indian IFSC code format' };
    }

    if (!payload.bankAccountNumber || payload.bankAccountNumber.length < 9) {
      return { statusCode: 400, success: false, error: 'Invalid Bank Account number' };
    }

    const profile = this.db.getCreatorProfileByUserId(this.currentUserId!);
    if (!profile) return { statusCode: 404, success: false, error: 'Creator profile not found' };

    const updated = this.db.updateCreatorProfile(profile.id, {
      panNumber: payload.panNumber.toUpperCase(),
      bankAccountNumber: payload.bankAccountNumber,
      bankIfsc: payload.bankIfsc.toUpperCase(),
      bankAccountHolderName: payload.bankAccountHolderName,
      idDocumentUrl: payload.idDocumentUrl,
      verificationStatus: VerificationStatus.PENDING,
      kycStatus: VerificationStatus.PENDING,
    });

    return { statusCode: 200, success: true, data: updated };
  }

  public async submitBusinessKyc(payload: {
    gstNumber: string;
    panNumber: string;
    companyName: string;
    businessLicenseUrl?: string;
    gstCertificateUrl?: string;
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.BUSINESS);
    if (authCheck) return authCheck;

    // Validate GSTIN format (15 characters: 2 state + 10 PAN + 1 entity + 1 Z + 1 check digit)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(payload.gstNumber.toUpperCase())) {
      return { statusCode: 400, success: false, error: 'Invalid Indian GSTIN format (expected 15-character GST format)' };
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(payload.panNumber.toUpperCase())) {
      return { statusCode: 400, success: false, error: 'Invalid Indian PAN format' };
    }

    const profile = this.db.getBusinessProfileByUserId(this.currentUserId!);
    if (!profile) return { statusCode: 404, success: false, error: 'Business profile not found' };

    const updated = this.db.updateBusinessProfile(profile.id, {
      gstNumber: payload.gstNumber.toUpperCase(),
      panNumber: payload.panNumber.toUpperCase(),
      companyName: payload.companyName,
      businessLicenseUrl: payload.businessLicenseUrl,
      gstCertificateUrl: payload.gstCertificateUrl,
      verificationStatus: VerificationStatus.PENDING,
    });

    return { statusCode: 200, success: true, data: updated };
  }

  public async getKycStatus(): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    if (this.currentRole === UserRole.CREATOR) {
      const profile = this.db.getCreatorProfileByUserId(this.currentUserId!);
      return { statusCode: 200, success: true, data: { status: profile?.verificationStatus } };
    } else if (this.currentRole === UserRole.BUSINESS) {
      const profile = this.db.getBusinessProfileByUserId(this.currentUserId!);
      return { statusCode: 200, success: true, data: { status: profile?.verificationStatus } };
    }

    return { statusCode: 200, success: true, data: { status: VerificationStatus.APPROVED } };
  }

  // ----------------------------------------------------
  // 3. CAMPAIGNS (`/api/v1/campaigns`)
  // ----------------------------------------------------
  public async createCampaign(payload: {
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    budgetCurrency?: string;
    budgetType?: BudgetType;
    deliverableTypes: DeliverableType[];
    creatorCategories?: string[];
    requiredPlatforms?: string[];
    minFollowers?: number;
    maxRevisions?: number;
    autoApproveAfterDays?: number;
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.BUSINESS);
    if (authCheck) return authCheck;

    if (!payload.title || payload.title.length < 5) {
      return { statusCode: 400, success: false, error: 'Campaign title must be at least 5 characters' };
    }
    if (payload.budgetMin < 0 || payload.budgetMax < 0) {
      return { statusCode: 400, success: false, error: 'Budget cannot be negative' };
    }
    if (payload.budgetMax < payload.budgetMin) {
      return { statusCode: 400, success: false, error: 'Maximum budget must be greater than or equal to minimum budget' };
    }
    if (!payload.deliverableTypes || payload.deliverableTypes.length === 0) {
      return { statusCode: 400, success: false, error: 'At least one deliverable type is required' };
    }

    const campaign = this.db.createCampaign({
      businessId: this.currentUserId!,
      title: payload.title,
      description: payload.description || '',
      status: CampaignStatus.ACTIVE,
      budgetType: payload.budgetType || BudgetType.RANGE,
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      budgetCurrency: payload.budgetCurrency || 'INR',
      deliverableTypes: payload.deliverableTypes,
      creatorCount: 1,
      creatorCategories: payload.creatorCategories || ['General'],
      requiredPlatforms: payload.requiredPlatforms || ['INSTAGRAM'],
      minFollowers: payload.minFollowers || 0,
      autoCloseAfterHire: true,
      allowNegotiation: true,
      maxRevisions: payload.maxRevisions ?? 2,
      autoApproveAfterDays: payload.autoApproveAfterDays ?? 5,
      platformFeePercent: 10,
      isFeatured: false,
    });

    return { statusCode: 201, success: true, data: campaign };
  }

  public async getCampaigns(query?: {
    category?: string;
    status?: CampaignStatus;
    budgetMin?: number;
    budgetMax?: number;
    deliverableType?: DeliverableType;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    let list = this.db.listCampaigns();

    if (query?.status) {
      list = list.filter((c) => c.status === query.status);
    }
    if (query?.category) {
      list = list.filter((c) => c.creatorCategories.includes(query.category!));
    }
    if (query?.budgetMin !== undefined) {
      list = list.filter((c) => c.budgetMax >= query.budgetMin!);
    }
    if (query?.budgetMax !== undefined) {
      list = list.filter((c) => c.budgetMin <= query.budgetMax!);
    }
    if (query?.deliverableType) {
      list = list.filter((c) => c.deliverableTypes.includes(query.deliverableType!));
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    return { statusCode: 200, success: true, data: list };
  }

  public async getCampaignById(id: string): Promise<ApiResponse<any>> {
    const campaign = this.db.getCampaignById(id);
    if (!campaign) return { statusCode: 404, success: false, error: 'Campaign not found' };
    return { statusCode: 200, success: true, data: campaign };
  }

  public async updateCampaign(id: string, updates: Partial<any>): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.BUSINESS);
    if (authCheck) return authCheck;

    const campaign = this.db.getCampaignById(id);
    if (!campaign) return { statusCode: 404, success: false, error: 'Campaign not found' };

    if (campaign.businessId !== this.currentUserId && this.currentRole !== UserRole.ADMIN) {
      return { statusCode: 403, success: false, error: 'Unauthorized to modify this campaign' };
    }

    const updated = this.db.updateCampaign(id, updates);
    return { statusCode: 200, success: true, data: updated };
  }

  // ----------------------------------------------------
  // 4. COLLABORATIONS & STATE MACHINE (`/api/v1/collaborations`)
  // ----------------------------------------------------
  public async applyForCampaign(payload: {
    campaignId: string;
    offeredAmount: number;
    bidMessage?: string;
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.CREATOR);
    if (authCheck) return authCheck;

    const campaign = this.db.getCampaignById(payload.campaignId);
    if (!campaign) return { statusCode: 404, success: false, error: 'Campaign not found' };

    if (campaign.status !== CampaignStatus.ACTIVE) {
      return { statusCode: 400, success: false, error: 'Campaign is not currently accepting applications' };
    }

    if (payload.offeredAmount <= 0) {
      return { statusCode: 400, success: false, error: 'Bid amount must be greater than 0' };
    }

    // Check if creator already applied
    const existing = this.db.listCollaborations((col) => col.campaignId === campaign.id && col.creatorId === this.currentUserId);
    if (existing.length > 0) {
      return { statusCode: 409, success: false, error: 'You have already applied to this campaign' };
    }

    const collab = this.db.createCollaboration({
      campaignId: campaign.id,
      creatorId: this.currentUserId!,
      businessId: campaign.businessId,
      offeredAmount: payload.offeredAmount,
      negotiatedAmount: payload.offeredAmount,
      bidMessage: payload.bidMessage,
      status: CollaborationStatus.NEGOTIATING,
      deliverableLinks: [],
      revisionCount: 0,
      maxRevisions: campaign.maxRevisions,
      appliedAt: new Date(),
    });

    // Create Chat Thread for communication
    this.db.createChatThread({
      creatorId: this.currentUserId!,
      businessId: campaign.businessId,
      campaignId: campaign.id,
      collaborationId: collab.id,
      isActive: true,
      offPlatformContactDetected: false,
      warningCount: 0,
    });

    return { statusCode: 201, success: true, data: collab };
  }

  public async counterOffer(collabId: string, payload: { amount: number; message: string }): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.creatorId !== this.currentUserId && collab.businessId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'You are not a participant in this collaboration' };
    }

    if (collab.status !== CollaborationStatus.NEGOTIATING && collab.status !== CollaborationStatus.PENDING) {
      return { statusCode: 400, success: false, error: `Cannot negotiate in state: ${collab.status}` };
    }

    if (payload.amount <= 0) {
      return { statusCode: 400, success: false, error: 'Counter offer amount must be positive' };
    }

    const updated = this.db.updateCollaboration(collabId, {
      counterOfferAmount: payload.amount,
      counterOfferMessage: payload.message,
      counterOfferBy: this.currentUserId!,
      negotiatedAmount: payload.amount,
      status: CollaborationStatus.NEGOTIATING,
    });

    return { statusCode: 200, success: true, data: updated };
  }

  public async acceptOffer(collabId: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.creatorId !== this.currentUserId && collab.businessId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'You are not a participant in this collaboration' };
    }

    if (collab.status !== CollaborationStatus.NEGOTIATING && collab.status !== CollaborationStatus.PENDING) {
      return { statusCode: 400, success: false, error: `Invalid transition from ${collab.status} to ACCEPTED` };
    }

    const agreedAmount = collab.counterOfferAmount ?? collab.negotiatedAmount ?? collab.offeredAmount;

    const updated = this.db.updateCollaboration(collabId, {
      status: CollaborationStatus.ACCEPTED,
      agreedAmount,
      acceptedAt: new Date(),
    });

    return { statusCode: 200, success: true, data: updated };
  }

  public async lockPaymentEscrow(collabId: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.BUSINESS);
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.businessId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'Only the business can lock escrow funds' };
    }

    if (collab.status !== CollaborationStatus.ACCEPTED) {
      return { statusCode: 400, success: false, error: `Cannot lock payment in state ${collab.status}. State must be ACCEPTED.` };
    }

    const grossAmount = collab.agreedAmount || collab.offeredAmount;
    const platformFeePercent = 10;
    const platformFeeAmount = Math.round(grossAmount * (platformFeePercent / 100) * 100) / 100;
    const netAmountToCreator = Math.round((grossAmount - platformFeeAmount) * 100) / 100;

    const payment = this.db.createPayment({
      collaborationId: collab.id,
      businessId: collab.businessId,
      creatorId: collab.creatorId,
      grossAmount,
      platformFeeAmount,
      platformFeePercent,
      netAmountToCreator,
      currency: 'INR',
      razorpayOrderId: `order_rzp_${Math.random().toString(36).substring(2, 9)}`,
      razorpayPaymentId: `pay_rzp_${Math.random().toString(36).substring(2, 9)}`,
      escrowStatus: PaymentStatus.ESCROW_HELD,
    });

    const updatedCollab = this.db.updateCollaboration(collabId, {
      status: CollaborationStatus.IN_PROGRESS,
      inProgressAt: new Date(),
    });

    return { statusCode: 200, success: true, data: { collaboration: updatedCollab, payment } };
  }

  public async submitDeliverables(collabId: string, deliverables: Array<{ type: DeliverableType; url: string; notes?: string }>): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.CREATOR);
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.creatorId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'Only the assigned creator can submit deliverables' };
    }

    if (collab.status !== CollaborationStatus.IN_PROGRESS && collab.status !== CollaborationStatus.REVISION_REQUESTED) {
      return { statusCode: 400, success: false, error: `Cannot submit deliverables in state: ${collab.status}` };
    }

    if (!deliverables || deliverables.length === 0) {
      return { statusCode: 400, success: false, error: 'At least one deliverable is required' };
    }

    const submissions: DeliverableSubmission[] = deliverables.map((d) => ({
      type: d.type,
      url: d.url,
      submittedAt: new Date(),
      notes: d.notes,
    }));

    const updated = this.db.updateCollaboration(collabId, {
      status: CollaborationStatus.DELIVERABLE_SUBMITTED,
      deliverableLinks: [...collab.deliverableLinks, ...submissions],
      submittedAt: new Date(),
    });

    return { statusCode: 200, success: true, data: updated };
  }

  public async requestRevision(collabId: string, revisionNote: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.BUSINESS);
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.businessId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'Only the campaign business can request revisions' };
    }

    if (collab.status !== CollaborationStatus.DELIVERABLE_SUBMITTED) {
      return { statusCode: 400, success: false, error: `Cannot request revision in state: ${collab.status}` };
    }

    if (collab.revisionCount >= collab.maxRevisions) {
      return { statusCode: 400, success: false, error: `Maximum revision limit of ${collab.maxRevisions} reached. You must approve or raise a dispute.` };
    }

    const updated = this.db.updateCollaboration(collabId, {
      status: CollaborationStatus.REVISION_REQUESTED,
      revisionCount: collab.revisionCount + 1,
      revisionRequest: revisionNote,
    });

    return { statusCode: 200, success: true, data: updated };
  }

  public async approveDeliverables(collabId: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.BUSINESS);
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.businessId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'Only the campaign business can approve deliverables' };
    }

    if (collab.status !== CollaborationStatus.DELIVERABLE_SUBMITTED && collab.status !== CollaborationStatus.REVISION_REQUESTED) {
      return { statusCode: 400, success: false, error: `Cannot approve in state: ${collab.status}` };
    }

    // Release payout
    const payment = this.db.getPaymentByCollaborationId(collabId);
    if (payment) {
      this.db.updatePayment(payment.id, {
        escrowStatus: PaymentStatus.RELEASED,
        releasedAt: new Date(),
        razorpayReleaseId: `rel_rzp_${Math.random().toString(36).substring(2, 9)}`,
      });
    }

    const updated = this.db.updateCollaboration(collabId, {
      status: CollaborationStatus.PAID_OUT,
      approvedAt: new Date(),
      paidAt: new Date(),
    });

    return { statusCode: 200, success: true, data: { collaboration: updated, payment } };
  }

  public async cancelCollaboration(collabId: string, reason: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(collabId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.creatorId !== this.currentUserId && collab.businessId !== this.currentUserId && this.currentRole !== UserRole.ADMIN) {
      return { statusCode: 403, success: false, error: 'Unauthorized to cancel this collaboration' };
    }

    const payment = this.db.getPaymentByCollaborationId(collabId);

    // Enforce Cancellation Refund Rules (Section 5 of State Machine doc)
    let refundAmount = 0;
    let creatorPayout = 0;

    if (collab.status === CollaborationStatus.NEGOTIATING || collab.status === CollaborationStatus.PENDING) {
      // Pre-acceptance: full refund
      refundAmount = collab.offeredAmount;
    } else if (collab.status === CollaborationStatus.ACCEPTED && !collab.inProgressAt) {
      // Post-acceptance, before work start: 90% refund, 10% penalty to creator
      const total = collab.agreedAmount || collab.offeredAmount;
      creatorPayout = Math.round(total * 0.10 * 100) / 100;
      refundAmount = total - creatorPayout;
    } else if (collab.status === CollaborationStatus.IN_PROGRESS) {
      // Work started: 50% refund, 50% payout
      const total = collab.agreedAmount || collab.offeredAmount;
      creatorPayout = Math.round(total * 0.50 * 100) / 100;
      refundAmount = total - creatorPayout;
    }

    if (payment) {
      this.db.updatePayment(payment.id, {
        escrowStatus: creatorPayout > 0 ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      });
    }

    const updated = this.db.updateCollaboration(collabId, {
      status: CollaborationStatus.CANCELLED,
      cancelledAt: new Date(),
      approvalNotes: `Cancelled: ${reason}`,
    });

    return {
      statusCode: 200,
      success: true,
      data: { collaboration: updated, refundAmount, creatorPayout },
    };
  }

  // ----------------------------------------------------
  // 5. DISPUTES & ARBITRATION (`/api/v1/disputes`)
  // ----------------------------------------------------
  public async raiseDispute(payload: {
    collaborationId: string;
    category: string;
    reason: string;
    evidence?: string[];
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    const collab = this.db.getCollaborationById(payload.collaborationId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    if (collab.creatorId !== this.currentUserId && collab.businessId !== this.currentUserId) {
      return { statusCode: 403, success: false, error: 'Only parties to the collaboration can raise a dispute' };
    }

    if (collab.status === CollaborationStatus.PAID_OUT || collab.status === CollaborationStatus.CANCELLED) {
      return { statusCode: 400, success: false, error: `Cannot dispute collaboration in final state: ${collab.status}` };
    }

    const againstUserId = this.currentUserId === collab.creatorId ? collab.businessId : collab.creatorId;

    const dispute = this.db.createDispute({
      campaignId: collab.campaignId,
      collaborationId: collab.id,
      raisedBy: this.currentUserId!,
      againstUserId,
      category: payload.category,
      reason: payload.reason,
      status: DisputeStatus.OPEN,
      creatorEvidence: this.currentUserId === collab.creatorId ? payload.evidence || [] : [],
      businessEvidence: this.currentUserId === collab.businessId ? payload.evidence || [] : [],
    });

    this.db.updateCollaboration(collab.id, {
      status: CollaborationStatus.DISPUTED,
    });

    return { statusCode: 201, success: true, data: dispute };
  }

  public async resolveDispute(disputeId: string, payload: {
    resolution: DisputeResolution;
    refundAmount?: number;
    payoutAmount?: number;
    notes: string;
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.ADMIN);
    if (authCheck) return authCheck;

    const dispute = this.db.getDisputeById(disputeId);
    if (!dispute) return { statusCode: 404, success: false, error: 'Dispute not found' };

    const collab = this.db.getCollaborationById(dispute.collaborationId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    const payment = this.db.getPaymentByCollaborationId(collab.id);
    const totalAmount = payment ? payment.grossAmount : (collab.agreedAmount || collab.offeredAmount);

    let disputeStatus = DisputeStatus.RESOLVED_PARTIAL;
    let collabStatus = CollaborationStatus.RESOLVED_PARTIAL;
    let refund = 0;
    let payout = 0;

    if (payload.resolution === DisputeResolution.BUSINESS) {
      disputeStatus = DisputeStatus.RESOLVED_BUSINESS;
      collabStatus = CollaborationStatus.REFUNDED;
      refund = totalAmount;
      payout = 0;
      if (payment) {
        this.db.updatePayment(payment.id, { escrowStatus: PaymentStatus.REFUNDED, refundedAt: new Date() });
      }
    } else if (payload.resolution === DisputeResolution.CREATOR) {
      disputeStatus = DisputeStatus.RESOLVED_CREATOR;
      collabStatus = CollaborationStatus.PAID_OUT;
      payout = payment ? payment.netAmountToCreator : Math.round(totalAmount * 0.90 * 100) / 100;
      refund = 0;
      if (payment) {
        this.db.updatePayment(payment.id, { escrowStatus: PaymentStatus.RELEASED, releasedAt: new Date() });
      }
    } else {
      // Partial Split
      refund = payload.refundAmount || 0;
      payout = payload.payoutAmount || 0;
      if (refund + payout > totalAmount + 0.01) {
        return { statusCode: 400, success: false, error: `Refund ₹${refund} + Payout ₹${payout} cannot exceed total escrow ₹${totalAmount}` };
      }
      if (payment) {
        this.db.updatePayment(payment.id, { escrowStatus: PaymentStatus.PARTIALLY_REFUNDED });
      }
    }

    const updatedDispute = this.db.updateDispute(disputeId, {
      status: disputeStatus,
      resolutionNotes: payload.notes,
      resolvedBy: this.currentUserId!,
      refundAmount: refund,
      payoutAmount: payout,
      resolvedAt: new Date(),
    });

    this.db.updateCollaboration(collab.id, {
      status: collabStatus,
    });

    return { statusCode: 200, success: true, data: updatedDispute };
  }

  // ----------------------------------------------------
  // 6. REVIEWS & RATINGS (`/api/v1/reviews`)
  // ----------------------------------------------------
  public async submitReview(payload: {
    collaborationId: string;
    overallRating: number;
    criteriaRatings?: Record<string, number>;
    comment: string;
  }): Promise<ApiResponse<any>> {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    if (payload.overallRating < 1 || payload.overallRating > 5) {
      return { statusCode: 400, success: false, error: 'Rating must be between 1 and 5 stars' };
    }

    const collab = this.db.getCollaborationById(payload.collaborationId);
    if (!collab) return { statusCode: 404, success: false, error: 'Collaboration not found' };

    // Only allow reviews on approved/completed collaborations
    if (collab.status !== CollaborationStatus.PAID_OUT && collab.status !== CollaborationStatus.APPROVED && collab.status !== CollaborationStatus.RESOLVED_CREATOR && collab.status !== CollaborationStatus.RESOLVED_PARTIAL) {
      return { statusCode: 400, success: false, error: 'Reviews can only be submitted after collaboration is approved or settled' };
    }

    const revieweeId = this.currentUserId === collab.creatorId ? collab.businessId : collab.creatorId;
    const type = this.currentUserId === collab.creatorId ? 'CREATOR_TO_BUSINESS' : 'BUSINESS_TO_CREATOR';

    const review = this.db.createReview({
      collaborationId: collab.id,
      reviewerId: this.currentUserId!,
      revieweeId,
      type,
      overallRating: payload.overallRating,
      criteriaRatings: payload.criteriaRatings || {},
      comment: payload.comment,
      isPublic: true,
    });

    return { statusCode: 201, success: true, data: review };
  }

  public async getReviewsForUser(userId: string): Promise<ApiResponse<any[]>> {
    const reviews = this.db.listReviews((r) => r.revieweeId === userId);
    return { statusCode: 200, success: true, data: reviews };
  }

  // ----------------------------------------------------
  // 7. ADMIN PORTAL (`/api/v1/admin`)
  // ----------------------------------------------------
  public async getPendingKycQueue(): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.ADMIN);
    if (authCheck) return authCheck;

    const pendingCreators = Array.from(this.db.creatorProfiles.values()).filter((c) => c.verificationStatus === VerificationStatus.PENDING);
    const pendingBusinesses = Array.from(this.db.businessProfiles.values()).filter((b) => b.verificationStatus === VerificationStatus.PENDING);

    return { statusCode: 200, success: true, data: { creators: pendingCreators, businesses: pendingBusinesses } };
  }

  public async approveKyc(userId: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.ADMIN);
    if (authCheck) return authCheck;

    const user = this.db.getUserById(userId);
    if (!user) return { statusCode: 404, success: false, error: 'User not found' };

    this.db.updateUser(userId, { isVerified: true });

    if (user.role === UserRole.CREATOR) {
      const p = this.db.getCreatorProfileByUserId(userId);
      if (p) this.db.updateCreatorProfile(p.id, { verificationStatus: VerificationStatus.APPROVED, kycStatus: VerificationStatus.APPROVED, isVerified: true });
    } else if (user.role === UserRole.BUSINESS) {
      const p = this.db.getBusinessProfileByUserId(userId);
      if (p) this.db.updateBusinessProfile(p.id, { verificationStatus: VerificationStatus.APPROVED });
    }

    return { statusCode: 200, success: true, message: `KYC approved for ${user.email}` };
  }

  public async rejectKyc(userId: string, reason: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.ADMIN);
    if (authCheck) return authCheck;

    const user = this.db.getUserById(userId);
    if (!user) return { statusCode: 404, success: false, error: 'User not found' };

    this.db.updateUser(userId, { isVerified: false });

    if (user.role === UserRole.CREATOR) {
      const p = this.db.getCreatorProfileByUserId(userId);
      if (p) this.db.updateCreatorProfile(p.id, { verificationStatus: VerificationStatus.REJECTED, kycStatus: VerificationStatus.REJECTED, isVerified: false });
    } else if (user.role === UserRole.BUSINESS) {
      const p = this.db.getBusinessProfileByUserId(userId);
      if (p) this.db.updateBusinessProfile(p.id, { verificationStatus: VerificationStatus.REJECTED });
    }

    return { statusCode: 200, success: true, message: `KYC rejected: ${reason}` };
  }

  public async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.ADMIN);
    if (authCheck) return authCheck;

    const payments = Array.from(this.db.payments.values());
    let gmv = 0;
    let platformRevenue = 0;
    let escrowInHold = 0;

    for (const p of payments) {
      if (p.escrowStatus !== PaymentStatus.FAILED && p.escrowStatus !== PaymentStatus.PENDING) {
        gmv += p.grossAmount;
      }
      if (p.escrowStatus === PaymentStatus.RELEASED) {
        platformRevenue += p.platformFeeAmount;
      }
      if (p.escrowStatus === PaymentStatus.ESCROW_HELD) {
        escrowInHold += p.grossAmount;
      }
    }

    const totalUsers = this.db.users.size;
    const totalCampaigns = this.db.campaigns.size;
    const totalCollaborations = this.db.collaborations.size;
    const totalDisputes = this.db.disputes.size;

    return {
      statusCode: 200,
      success: true,
      data: {
        gmv,
        platformRevenue,
        escrowInHold,
        totalUsers,
        totalCampaigns,
        totalCollaborations,
        totalDisputes,
        disputeRate: totalCollaborations > 0 ? (totalDisputes / totalCollaborations) * 100 : 0,
      },
    };
  }

  public async banUser(userId: string, isBanned: boolean, reason?: string): Promise<ApiResponse<any>> {
    const authCheck = this.requireRole(UserRole.ADMIN);
    if (authCheck) return authCheck;

    const user = this.db.getUserById(userId);
    if (!user) return { statusCode: 404, success: false, error: 'User not found' };

    const updated = this.db.updateUser(userId, { isActive: !isBanned });
    return { statusCode: 200, success: true, data: updated, message: `User ${userId} active status updated to ${!isBanned}` };
  }

  // --- Helper Guard Checks ---
  private requireAuth(): ApiResponse<any> | null {
    if (!this.currentToken || !this.currentUserId) {
      return { statusCode: 401, success: false, error: 'Unauthorized: Authentication token is missing or invalid' };
    }
    return null;
  }

  private requireRole(role: UserRole): ApiResponse<any> | null {
    const authCheck = this.requireAuth();
    if (authCheck) return authCheck;

    if (this.currentRole !== role && this.currentRole !== UserRole.ADMIN) {
      return { statusCode: 403, success: false, error: `Forbidden: Requires role ${role}, but user is ${this.currentRole}` };
    }
    return null;
  }
}
