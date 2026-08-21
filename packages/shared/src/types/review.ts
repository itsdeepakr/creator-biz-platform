import { ReviewType } from './enums';

export interface CriteriaRating {
  communication?: number;
  qualityOfWork?: number;
  adherenceToDeadlines?: number;
  professionalism?: number;
  clarityOfBrief?: number;
  paymentPromptness?: number;
  [key: string]: number | undefined;
}

export interface ReviewDto {
  id: string;
  collaborationId: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerAvatarUrl?: string | null;
  revieweeId: string;
  revieweeName?: string;
  type: ReviewType;
  overallRating: number;
  criteriaRatings: CriteriaRating | Record<string, any>;
  comment?: string | null;
  isPublic: boolean;
  businessResponse?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateReviewDto {
  collaborationId: string;
  overallRating: number;
  criteriaRatings?: CriteriaRating;
  comment?: string;
}

export interface RespondToReviewDto {
  response: string;
}

export interface ReviewFilterDto {
  userId?: string;
  type?: ReviewType;
  minRating?: number;
  page?: number;
  limit?: number;
}
