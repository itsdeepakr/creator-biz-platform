/**
 * Tier 1: Feature Coverage — Mutual Ratings & Reviews
 * Requirements: ORIGINAL_REQUEST §R1, R3, R4, PROJECT.md F10
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { DeliverableType } from '../harness/types.ts';

export function runReviewsRatingsTests(ctx: TestContext): void {
  describe('Tier 1: Mutual Ratings & Reviews', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.09.1 - Business submits 5-star review and ratings for Creator post-completion', async () => {
      // 1. Setup completed collaboration
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      // 2. Business leaves review for Creator
      const reviewRes = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        criteriaRatings: {
          contentQuality: 5,
          communication: 5,
          adherenceToGuidelines: 5,
          punctuality: 5,
        },
        comment: 'Outstanding video quality! Clean sound design and on-time delivery.',
      });

      DomainAssertions.assertStatus(reviewRes, 201);
      expect(reviewRes.data?.overallRating).toBe(5);
      expect(reviewRes.data?.type).toBe('BUSINESS_TO_CREATOR');
      expect(reviewRes.data?.revieweeId).toBe(ctx.seeds.creatorVerified.id);
    });

    it('T1.09.2 - Creator submits mutual review and ratings for Business', async () => {
      // Setup completed collaboration
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      // Creator leaves review for Business
      ctx.asVerifiedCreator();
      const reviewRes = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        criteriaRatings: {
          clearBrief: 5,
          promptPayment: 5,
          professionalism: 5,
        },
        comment: 'Great brand to work with! Clear brief, timely feedback, instant payment release.',
      });

      DomainAssertions.assertStatus(reviewRes, 201);
      expect(reviewRes.data?.type).toBe('CREATOR_TO_BUSINESS');
      expect(reviewRes.data?.revieweeId).toBe(ctx.seeds.businessVerified.id);
    });

    it('T1.09.3 - Queries public reviews received by a user', async () => {
      // Setup and review
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);
      await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        comment: 'Super fast and creative!',
      });

      // Query Creator reviews
      const creatorReviews = await ctx.api.getReviewsForUser(ctx.seeds.creatorVerified.id);
      DomainAssertions.assertStatus(creatorReviews, 200);
      expect(creatorReviews.data).toHaveLength(1);
      expect(creatorReviews.data![0].comment).toContain('Super fast');
    });

    it('T1.09.4 - Prevents submitting reviews on non-settled collaborations', async () => {
      // Collaboration still in NEGOTIATING state
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      // Attempt review before approval
      const earlyReview = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        comment: 'Too early review attempt',
      });

      DomainAssertions.assertBadRequest(earlyReview);
      expect(earlyReview.error).toContain('Reviews can only be submitted after collaboration is approved');
    });

    it('T1.09.5 - Validates rating bounds (rejects 0 or >5 stars)', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      // Attempt rating of 6 stars -> 400 Bad Request
      const invalidReview = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 6,
        comment: 'Invalid star score',
      });

      DomainAssertions.assertBadRequest(invalidReview);
      expect(invalidReview.error).toContain('between 1 and 5 stars');
    });
  });
}
