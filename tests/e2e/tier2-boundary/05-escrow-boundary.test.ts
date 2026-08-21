/**
 * Tier 2: Boundary & Corner Cases — Payment Escrow
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';

export function runEscrowBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Payment Escrow Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.05.1 - Rejects locking escrow when collaboration is not in ACCEPTED state', async () => {
      // In NEGOTIATING state
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      // Business attempts to lock escrow before acceptance
      ctx.asVerifiedBusiness();
      const res = await ctx.api.lockPaymentEscrow(collabId);

      DomainAssertions.assertBadRequest(res);
      expect(res.error).toContain('Cannot lock payment in state');
    });

    it('T2.05.2 - Prevents Creator from calling lockPaymentEscrow endpoint', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);

      // Creator attempts to lock payment -> 403 Forbidden
      ctx.asVerifiedCreator();
      const res = await ctx.api.lockPaymentEscrow(collabId);

      DomainAssertions.assertForbidden(res);
    });

    it('T2.05.3 - Prevents non-owner business from funding escrow on another brand collaboration', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);

      // Business 2 attempts to lock escrow on Business 1's collaboration
      ctx.asUnverifiedBusiness();
      const res = await ctx.api.lockPaymentEscrow(collabId);

      DomainAssertions.assertForbidden(res);
    });

    it('T2.05.4 - Rejects double-locking payment on already funded IN_PROGRESS collaboration', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Second attempt to lock payment -> 400 Bad Request
      const secondLock = await ctx.api.lockPaymentEscrow(collabId);
      DomainAssertions.assertBadRequest(secondLock);
    });

    it('T2.05.5 - Rejects escrow lock with non-existent collaboration ID', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.lockPaymentEscrow('col_nonexistent_9999');
      DomainAssertions.assertNotFound(res);
    });
  });
}
