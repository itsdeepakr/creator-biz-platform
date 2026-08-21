/**
 * Tier 4: Real-World Scenario — Dispute Escalation with Creator Victory
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

export function runDisputeCreatorWinLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 3 — Dispute Escalation (Creator Full Win)', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Resolves unresponsiveness dispute with 100% escrow release to creator', async () => {
      // 1. Campaign & Escrow Setup
      ctx.asVerifiedBusiness();
      const campRes = await ctx.api.createCampaign({
        title: 'Premium Smart TV Showcase',
        description: 'Sponsored review reel showcasing display clarity.',
        budgetMin: 50000,
        budgetMax: 50000,
        budgetType: BudgetType.FIXED,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      });
      const campaignId = campRes.data.id;

      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({ campaignId, offeredAmount: 50000 });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // 2. Creator submits full deliverable proofs
      ctx.asVerifiedCreator();
      const submitRes = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/tv_showcase_final',
          notes: 'Full review uploaded live on Instagram with over 50,000 views in 48 hours.',
        },
      ]);
      DomainAssertions.assertCollaborationState(submitRes.data, CollaborationStatus.DELIVERABLE_SUBMITTED);

      // 3. Business goes unresponsive; Creator raises formal dispute
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Unresponsive Brand',
        reason: 'Reel was posted live 7 days ago and has 50k views. Brand representative stopped answering.',
        evidence: [
          'https://storage.creatorbiz.com/evidence/insights_screenshot_50k.png',
          'https://storage.creatorbiz.com/evidence/chat_history_unresponsive.png',
        ],
      });
      DomainAssertions.assertStatus(disputeRes, 201);
      const disputeId = disputeRes.data.id;
      DomainAssertions.assertDisputeStatus(disputeRes.data, DisputeStatus.OPEN);

      // 4. Admin conducts forensic review and adjudicates in favor of Creator
      ctx.asAdmin();
      const resolutionRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.CREATOR,
        notes: 'Verified live publication and metrics. Deliverable requirements fully satisfied.',
      });

      DomainAssertions.assertStatus(resolutionRes, 200);
      DomainAssertions.assertDisputeStatus(resolutionRes.data, DisputeStatus.RESOLVED_CREATOR);

      // 5. Escrow funds released to Creator
      const payment = ctx.db.getPaymentByCollaborationId(collabId)!;
      DomainAssertions.assertPaymentStatus(payment, PaymentStatus.RELEASED);
      // 50,000 INR: 10% fee (5000), 45000 payout to creator
      expect(payment.platformFeeAmount).toBe(5000);
      expect(payment.netAmountToCreator).toBe(45000);

      const collab = ctx.db.getCollaborationById(collabId)!;
      DomainAssertions.assertCollaborationState(collab, CollaborationStatus.PAID_OUT);
    });
  });
}
