import { CampaignStatus, DeliverableType } from './enums';

export interface DeliverableRequirement {
  type: DeliverableType;
  count: number;
  description?: string;
  durationSeconds?: number;
  guidelines?: string;
}

export interface CampaignDto {
  id: string;
  businessId: string;
  businessName?: string;
  businessLogoUrl?: string | null;
  title: string;
  description: string;
  status: CampaignStatus;
  budgetType: 'fixed' | 'range';
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetCurrency: string;
  deliverableTypes: DeliverableType[];
  deliverableDetails: DeliverableRequirement[] | Record<string, any>;
  creatorCount: number;
  creatorCategories: string[];
  requiredPlatforms: string[];
  requiredLocation?: string | null;
  minFollowers?: number | null;
  maxFollowers?: number | null;
  minEngagementRate?: number | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  applicationDeadline?: Date | string | null;
  autoCloseAfterHire: boolean;
  allowNegotiation: boolean;
  maxRevisions: number;
  autoApproveAfterDays?: number | null;
  collaborationsCount?: number;
  acceptedBidsCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCampaignDto {
  title: string;
  description: string;
  budgetType: 'fixed' | 'range';
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  deliverableTypes: DeliverableType[];
  deliverableDetails: DeliverableRequirement[] | Record<string, any>;
  creatorCount: number;
  creatorCategories?: string[];
  requiredPlatforms: string[];
  requiredLocation?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  autoCloseAfterHire?: boolean;
  allowNegotiation?: boolean;
  maxRevisions?: number;
  autoApproveAfterDays?: number;
}

export interface UpdateCampaignDto {
  title?: string;
  description?: string;
  status?: CampaignStatus;
  budgetType?: 'fixed' | 'range';
  budgetMin?: number;
  budgetMax?: number;
  deliverableTypes?: DeliverableType[];
  deliverableDetails?: DeliverableRequirement[] | Record<string, any>;
  creatorCount?: number;
  creatorCategories?: string[];
  requiredPlatforms?: string[];
  requiredLocation?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagementRate?: number;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  autoCloseAfterHire?: boolean;
  allowNegotiation?: boolean;
  maxRevisions?: number;
  autoApproveAfterDays?: number;
}

export interface CampaignFilterDto {
  status?: CampaignStatus;
  category?: string;
  platform?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  businessId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'budgetMax' | 'applicationDeadline';
  sortOrder?: 'asc' | 'desc';
}
