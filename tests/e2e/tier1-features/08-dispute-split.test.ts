/**
 * Tier 1: Feature Coverage — Dispute Raising, Moderation & Split Release
 * Requirements: ORIGINAL_REQUEST §R1, R2, R4, PROJECT.md F08
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import {
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
  DisputeResolution,
  DeliverableType,
} from '../harness/types.ts';

export function runDisputeSplitTests(ctx: TestContext): void {
  describe('Tier 1: Dispute Raising, Moderation & Split Release', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.08.1 - Either party raises a dispute on active collaboration -> DISPUTED', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Business raises dispute
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Non-responsive',
        reason: 'Creator stopped replying to script alignment messages.',
        evidence: ['https://storage.creatorbiz.com/evidence/chat_screenshot_1.png'],
      });

      DomainAssertions.assertStatus(disputeRes, 201);
      expect(disputeRes.data?.status).toBe(DisputeStatus.OPEN);
      expect(disputeRes.data?.category).toBe('Non-responsive');

      const collab = ctx.db.getCollaborationById(collabId);
      DomainAssertions.assertCollaborationState(collab!, CollaborationStatus.DISPUTED);
    });

    it('T1.08.2 - Admin resolves dispute in favor of Business -> Full Refund', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Business raises dispute
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Scope Violation',
        reason: 'Creator missed brand guidelines.',
      });
      const disputeId = disputeRes.data.id;

      // Admin resolves in favor of Business
      ctx.asAdmin();
      const resolveRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.BUSINESS,
        notes: 'Full refund to business due to confirmed scope non-compliance.',
      });

      DomainAssertions.assertStatus(resolveRes, 200);
      DomainAssertions.assertDisputeStatus(resolveRes.data, DisputeStatus.RESOLVED_BUSINESS);

      const payment = ctx.db.getPaymentByCollaborationId(collabId);
      DomainAssertions.assertPaymentStatus(payment!, PaymentStatus.REFUNDED);

      const collab = ctx.db.getCollaborationById(collabId);
      DomainAssertions.assertCollaborationState(collab!, CollaborationStatus.REFUNDED);
    });

    it('T1.08.3 - Admin resolves dispute in favor of Creator -> Full Payout Released', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 60000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);

      // Creator raises dispute (business unresponsive)
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Approval Delayed',
        reason: 'Business refusing to approve valid deliverable without reason.',
      });
      const disputeId = disputeRes.data.id;

      // Admin resolves in favor of Creator
      ctx.asAdmin();
      const resolveRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.CREATOR,
        notes: 'Creator delivered as requested; releasing full payment.',
      });

      DomainAssertions.assertStatus(resolveRes, 200);
      DomainAssertions.assertDisputeStatus(resolveRes.data, DisputeStatus.RESOLVED_CREATOR);

      const payment = ctx.db.getPaymentByCollaborationId(collabId);
      DomainAssertions.assertPaymentStatus(payment!, PaymentStatus.RELEASED);

      const collab = ctx.db.getCollaborationById(collabId);
      DomainAssertions.assertCollaborationState(collab!, CollaborationStatus.PAID_OUT);
    });

    it('T1.08.4 - Admin resolves dispute with Partial Split settlement', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Raise dispute
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Partial Deliverables',
        reason: 'Reel was delivered but YouTube short was not completed.',
      });
      const disputeId = disputeRes.data.id;

      // Admin resolves with 50/50 partial split: ₹25000 refund, ₹25000 payout
      ctx.asAdmin();
      const resolveRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.PARTIAL,
        refundAmount: 25000,
        payoutAmount: 25000,
        notes: 'Partial settlement based on delivered Instagram reel.',
      });

      DomainAssertions.assertStatus(resolveRes, 200);
      DomainAssertions.assertDisputeStatus(resolveRes.data, DisputeStatus.RESOLVED_PARTIAL);
      expect(resolveRes.data.refundAmount).toBe(25000);
      expect(resolveRes.data.payoutAmount).toBe(25000);

      const payment = ctx.db.getPaymentByCollaborationId(collabId);
      DomainAssertions.assertPaymentStatus(payment!, PaymentStatus.PARTIALLY_REFUNDED);
    });

    it('T1.08.5 - Prevents partial split resolution exceeding total escrow funds', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 30000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Refund Request',
        reason: 'Requesting refund',
      });
      const disputeId = disputeRes.data.id;

      // Attempt split exceeding total escrow (30000): 20000 refund + 20000 payout = 40000 -> 400 Bad Request
      ctx.asAdmin();
      const invalidSplitRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.PARTIAL,
        refundAmount: 20000,
        payoutAmount: 20000,
        notes: 'Over-allocated split',
      });

      DomainAssertions.assertBadRequest(invalidSplitRes);
      expect(invalidSplitRes.error).toContain('cannot exceed total escrow');
    });
  });
}
