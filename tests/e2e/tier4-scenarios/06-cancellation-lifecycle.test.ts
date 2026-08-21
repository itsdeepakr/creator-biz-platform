/**
 * Tier 4: Real-World Scenario — Tiered Cancellation Rules & Refund Penalties
 * Requirements: 03-state-machine/collaboration-state-machine.md §5
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { CollaborationStatus, PaymentStatus } from '../harness/types.ts';

export function runCancellationLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 6 — Tiered Cancellation & Refund Penalty Lifecycles', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Case A: Business cancels BEFORE creator acceptance -> Full refund (100%), 0 penalty', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      // Business cancels before accept
      ctx.asVerifiedBusiness();
      const cancelRes = await ctx.api.cancelCollaboration(collabId, 'Decided to postpone campaign.');

      DomainAssertions.assertStatus(cancelRes, 200);
      DomainAssertions.assertCollaborationState(cancelRes.data.collaboration, CollaborationStatus.CANCELLED);
      expect(cancelRes.data.refundAmount).toBe(50000);
      expect(cancelRes.data.creatorPayout).toBe(0);
    });

    it('Case B: Business cancels AFTER acceptance, BEFORE work starts -> 90% refund, 10% creator penalty', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 60000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);

      // Business cancels before creator starts work
      const cancelRes = await ctx.api.cancelCollaboration(collabId, 'Cancelled after contract accepted.');

      DomainAssertions.assertStatus(cancelRes, 200);
      DomainAssertions.assertCollaborationState(cancelRes.data.collaboration, CollaborationStatus.CANCELLED);
      // 10% of 60000 = 6000, refund = 54000
      expect(cancelRes.data.creatorPayout).toBe(6000);
      expect(cancelRes.data.refundAmount).toBe(54000);
    });

    it('Case C: Business cancels AFTER work started -> 50% refund, 50% creator payout', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 80000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Mark work started
      ctx.db.updateCollaboration(collabId, { inProgressAt: new Date() });

      // Business cancels after work started
      const cancelRes = await ctx.api.cancelCollaboration(collabId, 'Mid-production cancellation.');

      DomainAssertions.assertStatus(cancelRes, 200);
      DomainAssertions.assertCollaborationState(cancelRes.data.collaboration, CollaborationStatus.CANCELLED);
      // 50% of 80000 = 40000 payout, 40000 refund
      expect(cancelRes.data.creatorPayout).toBe(40000);
      expect(cancelRes.data.refundAmount).toBe(40000);

      const payment = ctx.db.getPaymentByCollaborationId(collabId)!;
      DomainAssertions.assertPaymentStatus(payment, PaymentStatus.PARTIALLY_REFUNDED);
    });
  });
}
