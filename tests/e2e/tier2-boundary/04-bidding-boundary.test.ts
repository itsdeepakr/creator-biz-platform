/**
 * Tier 2: Boundary & Corner Cases — Bidding & Negotiation
 */

import { describe, it, beforeEach } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';

export function runBiddingBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Bidding & Negotiation Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.04.1 - Rejects bid amount of zero or negative value', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 0,
      });

      DomainAssertions.assertBadRequest(res);
    });

    it('T2.04.2 - Rejects applying to non-active / draft campaign', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.draftCampaign.id, // DRAFT status
        offeredAmount: 20000,
      });

      DomainAssertions.assertBadRequest(res);
    });

    it('T2.04.3 - Rejects duplicate application by same creator with 409 Conflict', async () => {
      ctx.asVerifiedCreator();
      // First application
      await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 30000,
      });

      // Second duplicate application
      const duplicateRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 35000,
      });

      DomainAssertions.assertConflict(duplicateRes);
    });

    it('T2.04.4 - Prevents unauthorized third-party user from accepting or countering a bid', async () => {
      // Creator 1 applies to Business 1
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 35000,
      });
      const collabId = applyRes.data.id;

      // Creator 2 (third party) attempts to accept or counter
      ctx.asUnverifiedCreator();
      const counterRes = await ctx.api.counterOffer(collabId, { amount: 20000, message: 'Intruder counter' });
      DomainAssertions.assertForbidden(counterRes);

      const acceptRes = await ctx.api.acceptOffer(collabId);
      DomainAssertions.assertForbidden(acceptRes);
    });

    it('T2.04.5 - Rejects counter-offer with negative or zero price', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 35000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      const res = await ctx.api.counterOffer(collabId, { amount: -5000, message: 'Invalid negative counter' });
      DomainAssertions.assertBadRequest(res);
    });
  });
}
