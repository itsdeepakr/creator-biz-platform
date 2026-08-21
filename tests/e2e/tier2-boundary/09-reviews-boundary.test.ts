/**
 * Tier 2: Boundary & Corner Cases — Reviews & Ratings
 */

import { describe, it, beforeEach } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { DeliverableType } from '../harness/types.ts';

export function runReviewsBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Reviews & Ratings Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.09.1 - Rejects rating of 0 stars', async () => {
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
      await ctx.api.approveDeliverables(collabId);

      const res = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 0,
        comment: 'Zero star attempt',
      });

      DomainAssertions.assertBadRequest(res);
    });

    it('T2.09.2 - Rejects negative rating score', async () => {
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
      await ctx.api.approveDeliverables(collabId);

      const res = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: -3,
        comment: 'Negative score',
      });

      DomainAssertions.assertBadRequest(res);
    });

    it('T2.09.3 - Rejects rating score exceeding 5 stars (e.g. 10)', async () => {
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
      await ctx.api.approveDeliverables(collabId);

      const res = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 10,
        comment: '10 star attempt',
      });

      DomainAssertions.assertBadRequest(res);
    });

    it('T2.09.4 - Prevents review submission on non-existent collaboration ID', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.submitReview({
        collaborationId: 'col_nonexistent_9999',
        overallRating: 5,
        comment: 'Ghost review',
      });

      DomainAssertions.assertNotFound(res);
    });

    it('T2.09.5 - Rejects unauthenticated review submission', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.submitReview({
        collaborationId: 'col_some_id',
        overallRating: 5,
        comment: 'Anonymous review',
      });

      DomainAssertions.assertUnauthorized(res);
    });
  });
}
