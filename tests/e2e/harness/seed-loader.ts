/**
 * Seed Fixture Loader for E2E Test Scenarios
 */

import { InMemoryDatabase } from './database-client.ts';
import {
  UserRole,
  VerificationStatus,
  CampaignStatus,
  BudgetType,
  DeliverableType,
} from './types.ts';

export interface SeedData {
  admin: { id: string; email: string; token: string; role: UserRole };
  businessVerified: { id: string; email: string; token: string; profileId: string; role: UserRole };
  businessUnverified: { id: string; email: string; token: string; profileId: string; role: UserRole };
  creatorVerified: { id: string; email: string; token: string; profileId: string; role: UserRole };
  creatorUnverified: { id: string; email: string; token: string; profileId: string; role: UserRole };
  activeCampaign: { id: string; businessId: string; title: string; budgetMin: number; budgetMax: number };
  draftCampaign: { id: string; businessId: string; title: string };
}

export function loadSeedFixtures(db: InMemoryDatabase): SeedData {
  db.reset();

  // 1. Admin
  const adminUser = db.createUser({
    id: 'usr_admin_01',
    email: 'admin@creatorbiz.com',
    passwordHash: 'hashed_admin_pass_123',
    role: UserRole.ADMIN,
    displayName: 'Platform Super Admin',
    isActive: true,
    isVerified: true,
  });

  // 2. Verified Business
  const bizUser1 = db.createUser({
    id: 'usr_biz_01',
    email: 'biz1@techbrand.in',
    phone: '9876543210',
    passwordHash: 'hashed_biz1_pass_123',
    role: UserRole.BUSINESS,
    displayName: 'TechBrand Innovations Pvt Ltd',
    isActive: true,
    isVerified: true,
  });
  const bizProfile1 = db.createBusinessProfile({
    id: 'bp_biz_01',
    userId: bizUser1.id,
    companyName: 'TechBrand Innovations Pvt Ltd',
    companyType: 'PVT_LTD',
    industry: 'Technology & Consumer Electronics',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'IN',
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    verificationStatus: VerificationStatus.APPROVED,
    allowDirectInquiries: true,
    showInSearch: true,
  });

  // 3. Unverified Business
  const bizUser2 = db.createUser({
    id: 'usr_biz_02',
    email: 'biz2@fashionco.in',
    phone: '9876543211',
    passwordHash: 'hashed_biz2_pass_123',
    role: UserRole.BUSINESS,
    displayName: 'FashionCo Trends',
    isActive: true,
    isVerified: false,
  });
  const bizProfile2 = db.createBusinessProfile({
    id: 'bp_biz_02',
    userId: bizUser2.id,
    companyName: 'FashionCo Trends',
    companyType: 'SOLE_PROPRIETORSHIP',
    industry: 'Fashion & Apparel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'IN',
    verificationStatus: VerificationStatus.PENDING,
    allowDirectInquiries: false,
    showInSearch: false,
  });

  // 4. Verified Creator
  const creatorUser1 = db.createUser({
    id: 'usr_creator_01',
    email: 'creator1@techreviews.in',
    phone: '9123456780',
    passwordHash: 'hashed_creator1_pass_123',
    role: UserRole.CREATOR,
    displayName: 'Aarav Tech Reviews',
    isActive: true,
    isVerified: true,
  });
  const creatorProfile1 = db.createCreatorProfile({
    id: 'cp_creator_01',
    userId: creatorUser1.id,
    displayName: 'Aarav Tech Reviews',
    bio: 'Top gadget and smartphone reviewer in India.',
    category: 'Technology',
    subCategories: ['Smartphones', 'Laptops', 'Audio'],
    location: 'Bengaluru, India',
    languages: ['English', 'Hindi', 'Kannada'],
    isVerified: true,
    verificationStatus: VerificationStatus.APPROVED,
    kycStatus: VerificationStatus.APPROVED,
    hourlyRate: 5000,
    minProjectBudget: 25000,
    panNumber: 'ABCDE5678G',
    bankAccountNumber: '987654321012',
    bankIfsc: 'HDFC0001234',
    bankAccountHolderName: 'Aarav Sharma',
    socialStats: {
      instagramFollowers: 150000,
      instagramEngagement: 4.8,
      youtubeSubscribers: 320000,
      youtubeAvgViews: 75000,
    },
    socialStatsRefreshedAt: new Date(),
  });

  // 5. Unverified Creator
  const creatorUser2 = db.createUser({
    id: 'usr_creator_02',
    email: 'creator2@lifestyle.in',
    phone: '9123456781',
    passwordHash: 'hashed_creator2_pass_123',
    role: UserRole.CREATOR,
    displayName: 'Ananya Lifestyle Diaries',
    isActive: true,
    isVerified: false,
  });
  const creatorProfile2 = db.createCreatorProfile({
    id: 'cp_creator_02',
    userId: creatorUser2.id,
    displayName: 'Ananya Lifestyle Diaries',
    bio: 'Beauty, fashion, and lifestyle vlogs.',
    category: 'Lifestyle',
    subCategories: ['Beauty', 'Fashion', 'Travel'],
    location: 'Delhi NCR, India',
    languages: ['Hindi', 'English'],
    isVerified: false,
    verificationStatus: VerificationStatus.PENDING,
    kycStatus: VerificationStatus.PENDING,
    hourlyRate: 2000,
    minProjectBudget: 10000,
  });

  // 6. Active Campaign
  const activeCamp = db.createCampaign({
    id: 'cmp_active_01',
    businessId: bizUser1.id,
    title: 'Flagship Smartphone Launch Video Review',
    description: 'Looking for tech creators to create an unboxing and dedicated review reel & YouTube short.',
    status: CampaignStatus.ACTIVE,
    budgetType: BudgetType.RANGE,
    budgetMin: 30000,
    budgetMax: 60000,
    budgetCurrency: 'INR',
    deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.YOUTUBE_SHORTS],
    creatorCount: 2,
    creatorCategories: ['Technology'],
    requiredPlatforms: ['INSTAGRAM', 'YOUTUBE'],
    requiredLocation: 'India',
    minFollowers: 50000,
    minEngagementRate: 3.0,
    autoCloseAfterHire: true,
    allowNegotiation: true,
    maxRevisions: 2,
    autoApproveAfterDays: 5,
    platformFeePercent: 10,
    isFeatured: true,
  });

  // 7. Draft Campaign
  const draftCamp = db.createCampaign({
    id: 'cmp_draft_01',
    businessId: bizUser1.id,
    title: 'Upcoming Smartwatch Unboxing Draft',
    description: 'Draft campaign for next month product line launch.',
    status: CampaignStatus.DRAFT,
    budgetType: BudgetType.FIXED,
    budgetMin: 20000,
    budgetMax: 20000,
    budgetCurrency: 'INR',
    deliverableTypes: [DeliverableType.INSTAGRAM_POST],
    creatorCount: 1,
    creatorCategories: ['Technology'],
    requiredPlatforms: ['INSTAGRAM'],
    autoCloseAfterHire: true,
    allowNegotiation: true,
    maxRevisions: 2,
    autoApproveAfterDays: 5,
    platformFeePercent: 10,
    isFeatured: false,
  });

  return {
    admin: {
      id: adminUser.id,
      email: adminUser.email,
      token: `mock_jwt:${adminUser.id}:${adminUser.role}`,
      role: adminUser.role,
    },
    businessVerified: {
      id: bizUser1.id,
      email: bizUser1.email,
      token: `mock_jwt:${bizUser1.id}:${bizUser1.role}`,
      profileId: bizProfile1.id,
      role: bizUser1.role,
    },
    businessUnverified: {
      id: bizUser2.id,
      email: bizUser2.email,
      token: `mock_jwt:${bizUser2.id}:${bizUser2.role}`,
      profileId: bizProfile2.id,
      role: bizUser2.role,
    },
    creatorVerified: {
      id: creatorUser1.id,
      email: creatorUser1.email,
      token: `mock_jwt:${creatorUser1.id}:${creatorUser1.role}`,
      profileId: creatorProfile1.id,
      role: creatorUser1.role,
    },
    creatorUnverified: {
      id: creatorUser2.id,
      email: creatorUser2.email,
      token: `mock_jwt:${creatorUser2.id}:${creatorUser2.role}`,
      profileId: creatorProfile2.id,
      role: creatorUser2.role,
    },
    activeCampaign: {
      id: activeCamp.id,
      businessId: activeCamp.businessId,
      title: activeCamp.title,
      budgetMin: activeCamp.budgetMin,
      budgetMax: activeCamp.budgetMax,
    },
    draftCampaign: {
      id: draftCamp.id,
      businessId: draftCamp.businessId,
      title: draftCamp.title,
    },
  };
}
