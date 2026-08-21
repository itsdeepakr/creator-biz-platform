/**
 * Domain-Specific Assertion Helpers for E2E Test Suites
 */

import {
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
  CampaignStatus,
} from './types.ts';
import type {
  ApiResponse,
} from './types.ts';

export class DomainAssertions {
  /**
   * Asserts API Response status code and success flag
   */
  public static assertStatus<T>(res: ApiResponse<T>, expectedStatusCode: number, message?: string): void {
    if (res.statusCode !== expectedStatusCode) {
      throw new Error(
        `Assertion Failed: Expected HTTP status ${expectedStatusCode}, but got ${res.statusCode}.\nResponse: ${JSON.stringify(res)}\n${message || ''}`
      );
    }
  }

  public static assertSuccess<T>(res: ApiResponse<T>, message?: string): T {
    if (!res.success || (res.statusCode < 200 || res.statusCode >= 300)) {
      throw new Error(
        `Assertion Failed: Expected successful response, but got failure (status ${res.statusCode}).\nError: ${res.error || res.message}\n${message || ''}`
      );
    }
    return res.data as T;
  }

  public static assertForbidden<T>(res: ApiResponse<T>, message?: string): void {
    if (res.statusCode !== 403) {
      throw new Error(
        `Assertion Failed: Expected HTTP 403 Forbidden, but received ${res.statusCode}.\nResponse: ${JSON.stringify(res)}\n${message || ''}`
      );
    }
  }

  public static assertUnauthorized<T>(res: ApiResponse<T>, message?: string): void {
    if (res.statusCode !== 401) {
      throw new Error(
        `Assertion Failed: Expected HTTP 401 Unauthorized, but received ${res.statusCode}.\nResponse: ${JSON.stringify(res)}\n${message || ''}`
      );
    }
  }

  public static assertBadRequest<T>(res: ApiResponse<T>, message?: string): void {
    if (res.statusCode !== 400) {
      throw new Error(
        `Assertion Failed: Expected HTTP 400 Bad Request, but received ${res.statusCode}.\nResponse: ${JSON.stringify(res)}\n${message || ''}`
      );
    }
  }

  public static assertConflict<T>(res: ApiResponse<T>, message?: string): void {
    if (res.statusCode !== 409) {
      throw new Error(
        `Assertion Failed: Expected HTTP 409 Conflict, but received ${res.statusCode}.\nResponse: ${JSON.stringify(res)}\n${message || ''}`
      );
    }
  }

  public static assertNotFound<T>(res: ApiResponse<T>, message?: string): void {
    if (res.statusCode !== 404) {
      throw new Error(
        `Assertion Failed: Expected HTTP 404 Not Found, but received ${res.statusCode}.\nResponse: ${JSON.stringify(res)}\n${message || ''}`
      );
    }
  }

  public static assertValidationError<T>(res: ApiResponse<T>, expectedKeyword?: string): void {
    if (res.statusCode !== 400 && res.statusCode !== 422) {
      throw new Error(
        `Assertion Failed: Expected validation error (HTTP 400/422), but got ${res.statusCode}.\nResponse: ${JSON.stringify(res)}`
      );
    }
    if (expectedKeyword) {
      const errStr = `${res.error || ''} ${res.message || ''} ${(res.errors || []).join(' ')}`.toLowerCase();
      if (!errStr.includes(expectedKeyword.toLowerCase())) {
        throw new Error(
          `Assertion Failed: Expected validation error to contain keyword "${expectedKeyword}", but got "${errStr}"`
        );
      }
    }
  }

  public static assertFeeCalculation(
    grossAmount: number,
    platformFeeAmount: number,
    netCreatorPayout: number,
    expectedFeePercent = 10
  ): void {
    const calculatedFee = Math.round(grossAmount * (expectedFeePercent / 100) * 100) / 100;
    const calculatedPayout = Math.round((grossAmount - calculatedFee) * 100) / 100;

    if (Math.abs(platformFeeAmount - calculatedFee) > 0.01) {
      throw new Error(
        `Fee Calculation Mismatch: Gross ₹${grossAmount} with ${expectedFeePercent}% fee expected ₹${calculatedFee}, got ₹${platformFeeAmount}`
      );
    }

    if (Math.abs(netCreatorPayout - calculatedPayout) > 0.01) {
      throw new Error(
        `Net Payout Calculation Mismatch: Expected ₹${calculatedPayout}, got ₹${netCreatorPayout}`
      );
    }

    if (Math.abs(grossAmount - (platformFeeAmount + netCreatorPayout)) > 0.01) {
      throw new Error(
        `Conservation of Funds Violation: Gross ₹${grossAmount} != Fee ₹${platformFeeAmount} + Payout ₹${netCreatorPayout}`
      );
    }
  }

  public static assertCollaborationState(
    collab: { status: CollaborationStatus },
    expectedStatus: CollaborationStatus
  ): void {
    if (collab.status !== expectedStatus) {
      throw new Error(
        `Collaboration State Error: Expected state "${expectedStatus}", but current status is "${collab.status}"`
      );
    }
  }

  public static assertPaymentStatus(
    payment: { escrowStatus: PaymentStatus },
    expectedStatus: PaymentStatus
  ): void {
    if (payment.escrowStatus !== expectedStatus) {
      throw new Error(
        `Payment Escrow State Error: Expected state "${expectedStatus}", but current status is "${payment.escrowStatus}"`
      );
    }
  }

  public static assertDisputeStatus(
    dispute: { status: DisputeStatus },
    expectedStatus: DisputeStatus
  ): void {
    if (dispute.status !== expectedStatus) {
      throw new Error(
        `Dispute State Error: Expected state "${expectedStatus}", but current status is "${dispute.status}"`
      );
    }
  }

  public static assertCampaignStatus(
    campaign: { status: CampaignStatus },
    expectedStatus: CampaignStatus
  ): void {
    if (campaign.status !== expectedStatus) {
      throw new Error(
        `Campaign State Error: Expected state "${expectedStatus}", but current status is "${campaign.status}"`
      );
    }
  }

  public static assertAntiDisintermediationFlag(
    messageRes: { isFlagged?: boolean; flagReason?: string },
    expectedKeyword?: string
  ): void {
    if (!messageRes.isFlagged) {
      throw new Error(
        `Safety Violation: Message containing off-platform contact details was NOT flagged! Message: ${JSON.stringify(messageRes)}`
      );
    }
    if (expectedKeyword && messageRes.flagReason) {
      if (!messageRes.flagReason.toLowerCase().includes(expectedKeyword.toLowerCase())) {
        throw new Error(
          `Safety Flag Reason Mismatch: Expected reason to contain "${expectedKeyword}", got "${messageRes.flagReason}"`
        );
      }
    }
  }
}
