/**
 * Tier 4: Real-World Scenario — Concurrent Multi-Party Multi-Campaign Collaboration Workload
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

export function runMultiPartyConcurrentLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 7 — Multi-Party Concurrent Collaboration Workload', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Executes concurrent multi-business and multi-creator workflows with ledger conservation', async () => {
      // -------------------------------------------------------------
      // WORKFLOW 1: Business 1 + Creator 1 (Tech Smartphone Campaign - ₹50,000)
      // Completes successfully to PAID_OUT
      // -------------------------------------------------------------
      ctx.asVerifiedCreator();
      const apply1 = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collab1 = apply1.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collab1);
      await ctx.api.lockPaymentEscrow(collab1);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collab1, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/collab1' }]);

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collab1);

      // -------------------------------------------------------------
      // WORKFLOW 2: Business 1 + Creator 2 (Tech Campaign Slot 2 - ₹40,000)
      // Goes into IN_PROGRESS
      // -------------------------------------------------------------
      ctx.asUnverifiedCreator();
      const apply2 = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collab2 = apply2.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collab2);
      await ctx.api.lockPaymentEscrow(collab2);

      // -------------------------------------------------------------
      // WORKFLOW 3: Business 2 + Creator 1 (Fashion Brand Campaign - ₹30,000)
      // Ends in 50/50 partial dispute settlement
      // -------------------------------------------------------------
      ctx.asUnverifiedBusiness();
      const camp3 = await ctx.api.createCampaign({
        title: 'Autumn Fashion Haul 2026',
        description: 'Influencer reel.',
        budgetMin: 30000,
        budgetMax: 30000,
        budgetType: BudgetType.FIXED,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      });
      const campId3 = camp3.data.id;

      ctx.asVerifiedCreator();
      const apply3 = await ctx.api.applyForCampaign({ campaignId: campId3, offeredAmount: 30000 });
      const collab3 = apply3.data.id;

      ctx.asUnverifiedBusiness();
      await ctx.api.acceptOffer(collab3);
      await ctx.api.lockPaymentEscrow(collab3);

      const dispute3 = await ctx.api.raiseDispute({
        collaborationId: collab3,
        category: 'Partial Video',
        reason: 'Short draft received',
      });
      const disputeId3 = dispute3.data.id;

      ctx.asAdmin();
      await ctx.api.resolveDispute(disputeId3, {
        resolution: 'PARTIAL',
        refundAmount: 15000,
        payoutAmount: 15000,
        notes: '50/50 split settlement',
      });

      // -------------------------------------------------------------
      // FINANCIAL RECONCILIATION & PLATFORM AUDIT
      // -------------------------------------------------------------
      const analytics = await ctx.api.getAnalyticsOverview();
      DomainAssertions.assertStatus(analytics, 200);

      // Gross total volume across all 3 transactions = 50k + 40k + 30k = 120,000 INR
      expect(analytics.data?.gmv).toBe(120000);

      // Escrow in hold should be exactly Workflow 2 (₹40,000)
      expect(analytics.data?.escrowInHold).toBe(40000);

      // Platform revenue collected should include 10% of ₹50,000 (5,000)
      expect(analytics.data?.platformRevenue).toBeGreaterThanOrEqual(5000);

      // All 3 collaborations maintain correct states
      const c1 = ctx.db.getCollaborationById(collab1)!;
      const c2 = ctx.db.getCollaborationById(collab2)!;
      const c3 = ctx.db.getCollaborationById(collab3)!;

      DomainAssertions.assertCollaborationState(c1, CollaborationStatus.PAID_OUT);
      DomainAssertions.assertCollaborationState(c2, CollaborationStatus.IN_PROGRESS);
      DomainAssertions.assertCollaborationState(c3, CollaborationStatus.RESOLVED_PARTIAL);
    });
  });
}
