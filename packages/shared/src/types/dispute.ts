import { DisputeStatus, DisputeOutcome } from './enums';

export interface DisputeEvidenceItem {
  id?: string;
  submittedBy: string;
  submittedAt: string | Date;
  description: string;
  mediaUrls: string[];
  fileType?: string;
}

export interface DisputeDto {
  id: string;
  collaborationId: string;
  campaignId: string;
  campaignTitle?: string;
  initiatedBy: string;
  initiatorName?: string;
  assignedTo?: string | null;
  resolverName?: string | null;
  reason: string;
  category: string;
  status: DisputeStatus;
  outcome?: DisputeOutcome | null;
  creatorEvidence?: DisputeEvidenceItem[] | Record<string, any> | null;
  businessEvidence?: DisputeEvidenceItem[] | Record<string, any> | null;
  resolutionNotes?: string | null;
  resolvedAt?: Date | string | null;
  amountRefunded?: number | null;
  amountReleased?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDisputeDto {
  collaborationId: string;
  reason: string;
  category: string;
  description?: string;
  evidenceUrls?: string[];
}

export interface AddDisputeEvidenceDto {
  description: string;
  mediaUrls: string[];
}

export interface ResolveDisputeDto {
  outcome: DisputeOutcome;
  resolutionNotes: string;
  amountRefunded?: number;
  amountReleased?: number;
}

export interface DisputeFilterDto {
  status?: DisputeStatus;
  category?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}
