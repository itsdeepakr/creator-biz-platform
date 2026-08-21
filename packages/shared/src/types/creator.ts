import { DeliverableType, VerificationStatus } from './enums';

export interface SocialConnectionDto {
  id: string;
  creatorId: string;
  platform: string;
  platformUserId: string;
  username: string;
  followerCount: number;
  followingCount: number;
  engagementRate?: number | null;
  avgViews?: number | null;
  audienceTopCities?: string[];
  lastSyncedAt?: Date | string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ServiceDto {
  id: string;
  creatorId: string;
  title: string;
  description?: string | null;
  deliverableTypes: DeliverableType[];
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: Date | string;
}

export interface PortfolioItemDto {
  id: string;
  creatorId: string;
  title: string;
  description?: string | null;
  mediaUrls: string[];
  tags: string[];
  deliverableType?: DeliverableType | null;
  createdAt: Date | string;
}

export interface SocialStatsData {
  instagram?: {
    username: string;
    followers: number;
    following: number;
    postsCount: number;
    engagementRate: number;
    avgLikes: number;
    avgComments: number;
    topCities?: string[];
    topAgeGroups?: Record<string, number>;
  };
  youtube?: {
    channelId: string;
    channelTitle: string;
    subscribers: number;
    videoCount: number;
    totalViews: number;
    avgViewsPerVideo: number;
    engagementRate: number;
  };
  totalReach: number;
  avgEngagementRate: number;
}

export interface CreatorProfileDto {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  category: string;
  subCategories: string[];
  location?: string | null;
  languages: string[];
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationNotes?: string | null;
  verificationSubmittedAt?: Date | string | null;
  verifiedAt?: Date | string | null;
  hourlyRate?: number | null;
  minProjectBudget?: number | null;
  panNumber?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankAccountHolderName?: string | null;
  idDocumentUrl?: string | null;
  idDocumentType?: string | null;
  kycStatus: VerificationStatus;
  socialStats?: SocialStatsData | null;
  socialStatsRefreshedAt?: Date | string | null;
  services?: ServiceDto[];
  portfolioItems?: PortfolioItemDto[];
  socialConnections?: SocialConnectionDto[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCreatorProfileDto {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  category: string;
  subCategories?: string[];
  location?: string;
  languages?: string[];
  hourlyRate?: number;
  minProjectBudget?: number;
}

export interface UpdateCreatorProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  category?: string;
  subCategories?: string[];
  location?: string;
  languages?: string[];
  hourlyRate?: number;
  minProjectBudget?: number;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolderName?: string;
}

export interface CreateServiceDto {
  title: string;
  description?: string;
  deliverableTypes: DeliverableType[];
  price: number;
  currency?: string;
}

export interface UpdateServiceDto {
  title?: string;
  description?: string;
  deliverableTypes?: DeliverableType[];
  price?: number;
  currency?: string;
  isActive?: boolean;
}

export interface CreatePortfolioItemDto {
  title: string;
  description?: string;
  mediaUrls: string[];
  tags?: string[];
  deliverableType?: DeliverableType;
}

export interface CreatorFilterDto {
  category?: string;
  subCategories?: string[];
  location?: string;
  languages?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  minBudget?: number;
  maxBudget?: number;
  isVerified?: boolean;
  platform?: string;
  search?: string;
  page?: number;
  limit?: number;
}
