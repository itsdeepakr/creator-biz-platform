/**
 * Tier 1: Feature Coverage — Bidding, Counter-Offer & Negotiation
 * Requirements: ORIGINAL_REQUEST §R1, R3, R4, PROJECT.md F05
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { CollaborationStatus } from '../harness/types.ts';

export function runBiddingNegotiationTests(ctx: TestContext): void {
  describe('Tier 1: Bidding, Counter-Offer & Negotiation', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.04.1 - Creator applies and submits initial bid to active campaign', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
        bidMessage: 'Hi! I have 150k tech followers and high 4.8% engagement. Would love to feature your phone.',
      });

      DomainAssertions.assertStatus(res, 201);
      expect(res.data?.id).toBeTruthy();
      expect(res.data?.status).toBe(CollaborationStatus.NEGOTIATING);
      expect(res.data?.offeredAmount).toBe(45000);
      expect(res.data?.creatorId).toBe(ctx.seeds.creatorVerified.id);
    });

    it('T1.04.2 - Business receives bid and submits counter-offer', async () => {
      // 1. Creator applies
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 55000,
        bidMessage: 'Pitching for 55k.',
      });
      const collabId = applyRes.data.id;

      // 2. Business counter-offers with 40k
      ctx.asVerifiedBusiness();
      const counterRes = await ctx.api.counterOffer(collabId, {
        amount: 40000,
        message: 'We can do 40,000 INR including both reel and short.',
      });

      DomainAssertions.assertStatus(counterRes, 200);
      expect(counterRes.data?.status).toBe(CollaborationStatus.NEGOTIATING);
      expect(counterRes.data?.counterOfferAmount).toBe(40000);
      expect(counterRes.data?.counterOfferBy).toBe(ctx.seeds.businessVerified.id);
    });

    it('T1.04.3 - Creator accepts Business counter-offer -> ACCEPTED state', async () => {
      // Setup bid & counter
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.counterOffer(collabId, { amount: 45000, message: 'Final offer 45k' });

      // Creator accepts
      ctx.asVerifiedCreator();
      const acceptRes = await ctx.api.acceptOffer(collabId);

      DomainAssertions.assertStatus(acceptRes, 200);
      DomainAssertions.assertCollaborationState(acceptRes.data, CollaborationStatus.ACCEPTED);
      expect(acceptRes.data?.agreedAmount).toBe(45000);
      expect(acceptRes.data?.acceptedAt).toBeTruthy();
    });

    it('T1.04.4 - Business accepts Creator original bid directly -> ACCEPTED state', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 42000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      const acceptRes = await ctx.api.acceptOffer(collabId);

      DomainAssertions.assertStatus(acceptRes, 200);
      DomainAssertions.assertCollaborationState(acceptRes.data, CollaborationStatus.ACCEPTED);
      expect(acceptRes.data?.agreedAmount).toBe(42000);
    });

    it('T1.04.5 - Party cancels collaboration during negotiation -> CANCELLED state', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 48000,
      });
      const collabId = applyRes.data.id;

      // Creator withdraws bid
      const cancelRes = await ctx.api.cancelCollaboration(collabId, 'No longer available for this campaign timeline.');

      DomainAssertions.assertStatus(cancelRes, 200);
      DomainAssertions.assertCollaborationState(cancelRes.data.collaboration, CollaborationStatus.CANCELLED);
      expect(cancelRes.data.refundAmount).toBe(48000);
    });
  });
}
