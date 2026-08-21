/**
 * Tier 1: Feature Coverage — Approval, Platform Fee & Payout Settlement
 * Requirements: ORIGINAL_REQUEST §R1, R3, PROJECT.md F06, F07
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { CollaborationStatus, PaymentStatus, DeliverableType } from '../harness/types.ts';

export function runApprovalPayoutTests(ctx: TestContext): void {
  describe('Tier 1: Approval, Platform Fee & Payout Settlement', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.07.1 - Business approves submitted deliverables -> transitions to PAID_OUT', async () => {
      // Setup submitted collaboration
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [
        { type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/valid_proof_01' },
      ]);

      // Business approves
      ctx.asVerifiedBusiness();
      const approveRes = await ctx.api.approveDeliverables(collabId);

      DomainAssertions.assertStatus(approveRes, 200);
      DomainAssertions.assertCollaborationState(approveRes.data.collaboration, CollaborationStatus.PAID_OUT);
      expect(approveRes.data.collaboration.approvedAt).toBeTruthy();
    });

    it('T1.07.2 - Escrow payment status transitions from ESCROW_HELD to RELEASED', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      const approveRes = await ctx.api.approveDeliverables(collabId);

      const payment = ctx.db.getPaymentByCollaborationId(collabId);
      expect(payment?.escrowStatus).toBe(PaymentStatus.RELEASED);
      expect(payment?.releasedAt).toBeTruthy();
      expect(payment?.razorpayReleaseId).toContain('rel_rzp_');
    });

    it('T1.07.3 - Platform fee (10%) and net payout amounts are conserved upon release', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 70000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      const payment = ctx.db.getPaymentByCollaborationId(collabId)!;
      // 10% of 70000 = 7000, net payout = 63000
      DomainAssertions.assertFeeCalculation(
        payment.grossAmount,
        payment.platformFeeAmount,
        payment.netAmountToCreator,
        10
      );
      expect(payment.platformFeeAmount).toBe(7000);
      expect(payment.netAmountToCreator).toBe(63000);
    });

    it('T1.07.4 - Admin platform analytics registers revenue collected upon payout', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      ctx.asAdmin();
      const analytics = await ctx.api.getAnalyticsOverview();
      // Revenue should have 10% of 50000 = 5000
      expect(analytics.data?.platformRevenue).toBeGreaterThanOrEqual(5000);
    });

    it('T1.07.5 - Prevents re-approving or modifying already settled collaboration', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      // Attempt second approval on already PAID_OUT collaboration -> 400 Bad Request
      const secondApprove = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertBadRequest(secondApprove);
    });
  });
}
