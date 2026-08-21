/**
 * Tier 2: Boundary & Corner Cases — Disputes & Arbitration
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { DisputeResolution, DeliverableType } from '../harness/types.ts';

export function runDisputeBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Disputes & Arbitration Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.08.1 - Prevents non-party user from raising a dispute', async () => {
      // Creator 1 & Business 1
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Creator 2 (outsider) attempts to dispute
      ctx.asUnverifiedCreator();
      const res = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Intrusion',
        reason: 'Unauthorized dispute attempt',
      });

      DomainAssertions.assertForbidden(res);
    });

    it('T2.08.2 - Rejects dispute on already settled and completed collaboration', async () => {
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
      await ctx.api.approveDeliverables(collabId); // Collaboration is now PAID_OUT

      // Business attempts to dispute after full payout release
      const lateDispute = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Post Payout Dispute',
        reason: 'Should be rejected',
      });

      DomainAssertions.assertBadRequest(lateDispute);
      expect(lateDispute.error).toContain('Cannot dispute collaboration in final state');
    });

    it('T2.08.3 - Prevents non-admin user from resolving a dispute', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Quality',
        reason: 'Content below expectations',
      });
      const disputeId = disputeRes.data.id;

      // Business attempts to self-resolve dispute
      const unauthorizedResolve = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.BUSINESS,
        notes: 'Business ruling for itself',
      });

      DomainAssertions.assertForbidden(unauthorizedResolve);
    });

    it('T2.08.4 - Rejects resolving non-existent dispute ID with 404 Not Found', async () => {
      ctx.asAdmin();
      const res = await ctx.api.resolveDispute('dsp_missing_0000', {
        resolution: DisputeResolution.BUSINESS,
        notes: 'Non existent dispute',
      });

      DomainAssertions.assertNotFound(res);
    });

    it('T2.08.5 - Rejects dispute on non-existent collaboration ID', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.raiseDispute({
        collaborationId: 'col_missing_0000',
        category: 'Ghost Collaboration',
        reason: 'Invalid',
      });

      DomainAssertions.assertNotFound(res);
    });
  });
}
