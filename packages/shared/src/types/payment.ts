import { PaymentStatus, EscrowTransactionType } from './enums';

export interface EscrowTransactionDto {
  id: string;
  paymentId: string;
  type: string | EscrowTransactionType;
  amount: number;
  gatewayEventId?: string | null;
  status: PaymentStatus;
  gatewayResponse?: Record<string, any> | null;
  createdAt: Date | string;
}

export interface PlatformFeeDto {
  id: string;
  paymentId: string;
  feeType: string;
  amount: number;
  percentage?: number | null;
  netRevenue: number;
  settlementStatus: string;
  settledAt?: Date | string | null;
  createdAt: Date | string;
}

export interface PaymentDto {
  id: string;
  collaborationId: string;
  businessId: string;
  creatorId: string;
  grossAmount: number;
  platformFeeAmount: number;
  platformFeePercent: number;
  netAmountToCreator: number;
  currency: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayReleaseId?: string | null;
  escrowStatus: PaymentStatus;
  gatewayResponse?: Record<string, any> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  releasedAt?: Date | string | null;
  refundedAt?: Date | string | null;
  escrowTransactions?: EscrowTransactionDto[];
  platformFee?: PlatformFeeDto | null;
}

export interface CreateEscrowOrderDto {
  collaborationId: string;
  currency?: string;
}

export interface CreateEscrowOrderResponseDto {
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  collaborationId: string;
  grossAmount: number;
  platformFeeAmount: number;
  netAmountToCreator: number;
}

export interface VerifyPaymentDto {
  collaborationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface ReleaseEscrowDto {
  collaborationId: string;
  notes?: string;
}

export interface RefundEscrowDto {
  collaborationId: string;
  reason: string;
  refundAmount?: number;
}

export interface SplitEscrowDto {
  collaborationId: string;
  creatorAmount: number;
  businessRefundAmount: number;
  notes: string;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        email: string;
        contact: string;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        amount_paid: number;
        status: string;
      };
    };
    transfer?: {
      entity: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
  created_at: number;
}
