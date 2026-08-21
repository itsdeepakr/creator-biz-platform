/**
 * Tier 1: Feature Coverage — Escrow Funding & Razorpay Integration
 * Requirements: ORIGINAL_REQUEST §R1, R4, PROJECT.md F07
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { CollaborationStatus, PaymentStatus } from '../harness/types.ts';

export function runEscrowFundingTests(ctx: TestContext): void {
  describe('Tier 1: Escrow Funding & Razorpay Integration', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.05.1 - Business locks payment into escrow for accepted collaboration -> IN_PROGRESS', async () => {
      // 1. Creator applies & Business accepts
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);

      // 2. Lock payment escrow
      const escrowRes = await ctx.api.lockPaymentEscrow(collabId);

      DomainAssertions.assertStatus(escrowRes, 200);
      DomainAssertions.assertCollaborationState(escrowRes.data.collaboration, CollaborationStatus.IN_PROGRESS);
      DomainAssertions.assertPaymentStatus(escrowRes.data.payment, PaymentStatus.ESCROW_HELD);
      expect(escrowRes.data.payment.grossAmount).toBe(50000);
    });

    it('T1.05.2 - Generates valid Razorpay Order ID & Payment ID during hold creation', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 35000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      const escrowRes = await ctx.api.lockPaymentEscrow(collabId);

      expect(escrowRes.data.payment.razorpayOrderId).toContain('order_rzp_');
      expect(escrowRes.data.payment.razorpayPaymentId).toContain('pay_rzp_');
    });

    it('T1.05.3 - Calculates exact 10% platform fee and net creator payout', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 60000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      const escrowRes = await ctx.api.lockPaymentEscrow(collabId);

      const payment = escrowRes.data.payment;
      // 10% of 60000 = 6000, payout = 54000
      DomainAssertions.assertFeeCalculation(
        payment.grossAmount,
        payment.platformFeeAmount,
        payment.netAmountToCreator,
        10
      );
      expect(payment.platformFeeAmount).toBe(6000);
      expect(payment.netAmountToCreator).toBe(54000);
    });

    it('T1.05.4 - Payment record is queryable from database with ESCROW_HELD status', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      const payment = ctx.db.getPaymentByCollaborationId(collabId);
      expect(payment).toBeDefined();
      expect(payment?.escrowStatus).toBe(PaymentStatus.ESCROW_HELD);
      expect(payment?.currency).toBe('INR');
    });

    it('T1.05.5 - Platform analytics reflects escrow balance in hold immediately', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asAdmin();
      const analyticsRes = await ctx.api.getAnalyticsOverview();
      expect(analyticsRes.data?.escrowInHold).toBeGreaterThanOrEqual(50000);
      expect(analyticsRes.data?.gmv).toBeGreaterThanOrEqual(50000);
    });
  });
}
