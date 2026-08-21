/**
 * Tier 2: Boundary & Corner Cases — Deliverables & Revisions
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { DeliverableType } from '../harness/types.ts';

export function runDeliverableBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Deliverables & Revisions Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.06.1 - Rejects submitting deliverables when payment escrow is not locked', async () => {
      // In ACCEPTED state (escrow not yet funded)
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);

      // Creator attempts to submit before escrow is locked
      ctx.asVerifiedCreator();
      const res = await ctx.api.submitDeliverables(collabId, [
        { type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' },
      ]);

      DomainAssertions.assertBadRequest(res);
      expect(res.error).toContain('Cannot submit deliverables in state: ACCEPTED');
    });

    it('T2.06.2 - Rejects empty deliverables submission list', async () => {
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
      const res = await ctx.api.submitDeliverables(collabId, []);
      DomainAssertions.assertBadRequest(res);
    });

    it('T2.06.3 - Prevents Business from submitting Creator deliverables', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Business attempts to call submitDeliverables
      const res = await ctx.api.submitDeliverables(collabId, [
        { type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' },
      ]);

      DomainAssertions.assertForbidden(res);
    });

    it('T2.06.4 - Rejects revision request when deliverables have not been submitted', async () => {
      // In IN_PROGRESS state (no deliverable submitted yet)
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Business attempts revision request prematurely
      const res = await ctx.api.requestRevision(collabId, 'Premature revision request');
      DomainAssertions.assertBadRequest(res);
      expect(res.error).toContain('Cannot request revision in state: IN_PROGRESS');
    });

    it('T2.06.5 - Prevents Creator from requesting revision (only Business allowed)', async () => {
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

      // Creator attempts to call requestRevision
      const res = await ctx.api.requestRevision(collabId, 'Self revision');
      DomainAssertions.assertForbidden(res);
    });
  });
}
