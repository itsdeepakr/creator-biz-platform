/**
 * Tier 4: Real-World Scenario — Multi-Round Deliverable Revision Cycle to Final Settlement
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import {
  CollaborationStatus,
  PaymentStatus,
  DeliverableType,
  BudgetType,
} from '../harness/types.ts';

export function runRevisionApprovalLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 2 — Multi-Round Deliverable Revision Cycle', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Executes multi-round revision cycle with notes, counters, and eventual settlement', async () => {
      // 1. Business creates Campaign
      ctx.asVerifiedBusiness();
      const campRes = await ctx.api.createCampaign({
        title: 'Festive Ethnic Fashion Lookbook 2026',
        description: '3-look transition reel featuring our new festive collection.',
        budgetMin: 35000,
        budgetMax: 50000,
        budgetType: BudgetType.RANGE,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
        maxRevisions: 2,
        autoApproveAfterDays: 5,
      });
      const campaignId = campRes.data.id;

      // 2. Creator applies with 35k
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId,
        offeredAmount: 35000,
        bidMessage: 'Excited to showcase the 3 festive looks.',
      });
      const collabId = applyRes.data.id;

      // 3. Business accepts & funds Escrow
      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      const escrowRes = await ctx.api.lockPaymentEscrow(collabId);
      DomainAssertions.assertPaymentStatus(escrowRes.data.payment, PaymentStatus.ESCROW_HELD);

      // ---------------------------------------------------------
      // ROUND 1: Submission -> Revision Request
      // ---------------------------------------------------------
      ctx.asVerifiedCreator();
      const submit1 = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/festive_lookbook_draft1',
          notes: 'Draft 1 completed with instrumental music background.',
        },
      ]);
      DomainAssertions.assertCollaborationState(submit1.data, CollaborationStatus.DELIVERABLE_SUBMITTED);

      ctx.asVerifiedBusiness();
      const rev1 = await ctx.api.requestRevision(collabId, 'Please add product SKU names as text overlays on each transition.');
      DomainAssertions.assertCollaborationState(rev1.data, CollaborationStatus.REVISION_REQUESTED);
      expect(rev1.data.revisionCount).toBe(1);

      // ---------------------------------------------------------
      // ROUND 2: Resubmission -> Revision Request 2
      // ---------------------------------------------------------
      ctx.asVerifiedCreator();
      const submit2 = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/festive_lookbook_draft2',
          notes: 'Added product SKU text overlays as requested.',
        },
      ]);
      DomainAssertions.assertCollaborationState(submit2.data, CollaborationStatus.DELIVERABLE_SUBMITTED);

      ctx.asVerifiedBusiness();
      const rev2 = await ctx.api.requestRevision(collabId, 'Text overlay looks great! Just brighten the color grading on the red saree look.');
      DomainAssertions.assertCollaborationState(rev2.data, CollaborationStatus.REVISION_REQUESTED);
      expect(rev2.data.revisionCount).toBe(2);

      // ---------------------------------------------------------
      // FINAL ROUND: Resubmission -> Approval
      // ---------------------------------------------------------
      ctx.asVerifiedCreator();
      const submit3 = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/festive_lookbook_draft3_final',
          notes: 'Color grading on red saree enhanced in 4K.',
        },
      ]);
      DomainAssertions.assertCollaborationState(submit3.data, CollaborationStatus.DELIVERABLE_SUBMITTED);

      ctx.asVerifiedBusiness();
      const approveRes = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertCollaborationState(approveRes.data.collaboration, CollaborationStatus.PAID_OUT);

      // Verify financial release
      const payment = ctx.db.getPaymentByCollaborationId(collabId)!;
      DomainAssertions.assertPaymentStatus(payment, PaymentStatus.RELEASED);
      // Gross 35000: Fee 3500, Net 31500
      expect(payment.platformFeeAmount).toBe(3500);
      expect(payment.netAmountToCreator).toBe(31500);
    });
  });
}
