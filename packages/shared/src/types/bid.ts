import { BidStatus, CollaborationStatus } from './enums';

export interface BidDto {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  creatorId: string;
  creatorDisplayName?: string;
  creatorAvatarUrl?: string | null;
  businessId: string;
  businessName?: string;
  bidAmount: number;
  bidMessage?: string | null;
  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;
  counterOfferBy?: string | null;
  agreedAmount: number;
  status: CollaborationStatus | BidStatus;
  appliedAt: Date | string;
  offeredAt?: Date | string | null;
  acceptedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateBidDto {
  campaignId: string;
  bidAmount: number;
  bidMessage?: string;
  proposedDeliverables?: Record<string, any>;
}

export interface CounterBidDto {
  counterAmount: number;
  counterMessage?: string;
}

export interface AcceptBidDto {
  agreedAmount?: number;
  notes?: string;
}

export interface RejectBidDto {
  reason?: string;
}
