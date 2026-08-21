import { CollaborationStatus, DeliverableType } from './enums';
import { CampaignDto } from './campaign';
import { CreatorProfileDto } from './creator';
import { BusinessProfileDto } from './business';
import { PaymentDto } from './payment';

export interface DeliverableSubmissionItem {
  id?: string;
  type: DeliverableType;
  title: string;
  liveUrl?: string;
  proofUrl?: string;
  previewUrl?: string;
  caption?: string;
  submittedAt: string | Date;
  notes?: string;
}

export interface RevisionRequestData {
  requestedBy: string;
  requestedAt: string | Date;
  feedback: string;
  specificChangesRequired: string[];
  deadline?: string | Date;
}

export interface CollaborationDto {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  creatorId: string;
  creatorDisplayName?: string;
  creatorAvatarUrl?: string | null;
  businessId: string;
  businessName?: string;
  businessLogoUrl?: string | null;
  bidAmount: number;
  bidMessage?: string | null;
  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;
  counterOfferBy?: string | null;
  agreedAmount: number;
  status: CollaborationStatus;
  deliverableLinks?: DeliverableSubmissionItem[] | Record<string, any> | null;
  revisionCount: number;
  revisionRequest?: RevisionRequestData | Record<string, any> | null;
  approvedAt?: Date | string | null;
  deliverableNotes?: string | null;
  appliedAt: Date | string;
  offeredAt?: Date | string | null;
  acceptedAt?: Date | string | null;
  startedAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  paidAt?: Date | string | null;
  revisionRequestedBy?: string | null;
  revisionDeadline?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CollaborationDetailDto extends CollaborationDto {
  campaign?: CampaignDto;
  creator?: CreatorProfileDto;
  business?: BusinessProfileDto;
  payment?: PaymentDto | null;
  chatThreadId?: string | null;
}

export interface SubmitDeliverablesDto {
  deliverables: DeliverableSubmissionItem[];
  deliverableNotes?: string;
}

export interface RequestRevisionDto {
  feedback: string;
  specificChangesRequired?: string[];
  revisionDeadline?: string;
}

export interface ApproveCollaborationDto {
  approvalNotes?: string;
}

export interface CancelCollaborationDto {
  reason: string;
}

export interface CollaborationFilterDto {
  status?: CollaborationStatus;
  campaignId?: string;
  creatorId?: string;
  businessId?: string;
  page?: number;
  limit?: number;
}
