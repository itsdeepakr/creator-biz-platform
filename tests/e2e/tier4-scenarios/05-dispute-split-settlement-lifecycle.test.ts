/**
 * Tier 4: Real-World Scenario — Dispute Arbitration with Partial Split Settlement
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

export function runDisputeSplitSettlementLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 5 — Dispute Arbitration with Partial Split Settlement', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Arbitrates partial completion dispute with custom split payout and refund', async () => {
      // 1. High budget campaign (₹100,000)
      ctx.asVerifiedBusiness();
      const campRes = await ctx.api.createCampaign({
        title: 'EV Scooter Long Distance Road Trip Series (2 Part Video)',
        description: 'Two full YouTube long-form videos covering a 500km journey.',
        budgetMin: 100000,
        budgetMax: 100000,
        budgetType: BudgetType.FIXED,
        deliverableTypes: [DeliverableType.YOUTUBE_VIDEO],
      });
      const campaignId = campRes.data.id;

      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({ campaignId, offeredAmount: 100000 });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      const escrowRes = await ctx.api.lockPaymentEscrow(collabId);
      expect(escrowRes.data.payment.grossAmount).toBe(100000);

      // 2. Creator delivers Video 1, but cannot complete Video 2 due to unforeseen circumstances
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.YOUTUBE_VIDEO,
          url: 'https://youtube.com/watch?v=part1_500km_journey',
          notes: 'Part 1 delivered (15 min video, 100k views). Unable to finish Part 2.',
        },
      ]);

      // 3. Parties agree to admin arbitration
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Partial Fulfillment',
        reason: 'Part 1 video was delivered and high performing, but Part 2 could not be shot.',
      });
      const disputeId = disputeRes.data.id;

      // 4. Admin adjudicates with 55/45 split: ₹55,000 refund to Business, ₹45,000 payout to Creator
      ctx.asAdmin();
      const resolutionRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.PARTIAL,
        refundAmount: 55000,
        payoutAmount: 45000,
        notes: 'Awarding ₹45,000 compensation for Part 1 video and refunding remaining ₹55,000 to business.',
      });

      DomainAssertions.assertStatus(resolutionRes, 200);
      DomainAssertions.assertDisputeStatus(resolutionRes.data, DisputeStatus.RESOLVED_PARTIAL);
      expect(resolutionRes.data.refundAmount).toBe(55000);
      expect(resolutionRes.data.payoutAmount).toBe(45000);

      // 5. Total funds conserved: ₹55,000 + ₹45,000 = ₹100,000
      expect(resolutionRes.data.refundAmount + resolutionRes.data.payoutAmount).toBe(100000);

      const payment = ctx.db.getPaymentByCollaborationId(collabId)!;
      DomainAssertions.assertPaymentStatus(payment, PaymentStatus.PARTIALLY_REFUNDED);
    });
  });
}
