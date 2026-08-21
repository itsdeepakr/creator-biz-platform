/**
 * Tier 4: Real-World Scenario — Dispute Escalation with Business Victory & Full Refund
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import {
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
  DisputeResolution,
  DeliverableType,
  BudgetType,
} from '../harness/types.ts';

export function runDisputeBusinessRefundLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 4 — Dispute Escalation (Business Full Refund)', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Resolves non-delivery dispute with 100% refund returned to business', async () => {
      // 1. Setup funded campaign
      ctx.asVerifiedBusiness();
      const campRes = await ctx.api.createCampaign({
        title: 'Fitness Supplement Honest Review',
        description: 'Sponsored post on fitness nutrition and protein intake.',
        budgetMin: 30000,
        budgetMax: 30000,
        budgetType: BudgetType.FIXED,
        deliverableTypes: [DeliverableType.INSTAGRAM_POST],
      });
      const campaignId = campRes.data.id;

      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({ campaignId, offeredAmount: 30000 });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // 2. Creator fails to deliver before deadline; Business raises dispute
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Non-Delivery / Abandonment',
        reason: 'Creator has not submitted any draft past the delivery deadline and stopped responding.',
      });
      DomainAssertions.assertStatus(disputeRes, 201);
      const disputeId = disputeRes.data.id;

      // 3. Admin investigates and rules in favor of Business
      ctx.asAdmin();
      const resolutionRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.BUSINESS,
        notes: 'Creator failed to deliver agreed content within stipulated timeframe. Full refund authorized.',
      });

      DomainAssertions.assertStatus(resolutionRes, 200);
      DomainAssertions.assertDisputeStatus(resolutionRes.data, DisputeStatus.RESOLVED_BUSINESS);

      // 4. Financial verification: 100% of escrow (₹30,000) refunded to Business
      const payment = ctx.db.getPaymentByCollaborationId(collabId)!;
      DomainAssertions.assertPaymentStatus(payment, PaymentStatus.REFUNDED);
      expect(payment.refundedAt).toBeTruthy();

      const collab = ctx.db.getCollaborationById(collabId)!;
      DomainAssertions.assertCollaborationState(collab, CollaborationStatus.REFUNDED);
    });
  });
}
