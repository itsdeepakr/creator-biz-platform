/**
 * Tier 2: Boundary & Corner Cases — Approval & Settlement
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { DeliverableType } from '../harness/types.ts';

export function runApprovalBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Approval & Settlement Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.07.1 - Prevents Creator from self-approving their own deliverables', async () => {
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

      // Creator attempts to self-approve
      const selfApprove = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertForbidden(selfApprove);
    });

    it('T2.07.2 - Rejects approval before deliverables are submitted (in IN_PROGRESS)', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Business attempts to approve before creator submits work
      const earlyApprove = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertBadRequest(earlyApprove);
      expect(earlyApprove.error).toContain('Cannot approve in state: IN_PROGRESS');
    });

    it('T2.07.3 - Prevents non-party business from approving deliverables', async () => {
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

      // Business 2 attempts to approve Business 1's collaboration
      ctx.asUnverifiedBusiness();
      const res = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertForbidden(res);
    });

    it('T2.07.4 - Rejects approval on non-existent collaboration ID', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.approveDeliverables('col_missing_9999');
      DomainAssertions.assertNotFound(res);
    });

    it('T2.07.5 - Rejects approval on cancelled collaboration', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      await ctx.api.cancelCollaboration(collabId, 'Cancelled before accept');

      ctx.asVerifiedBusiness();
      const res = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertBadRequest(res);
    });
  });
}
