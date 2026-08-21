/**
 * Tier 4: Real-World Scenario — Full Collaboration Happy Path Lifecycle
 * Requirements: ORIGINAL_REQUEST Acceptance Criteria, PROJECT.md M7
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

export function runHappyPathLifecycleTests(ctx: TestContext): void {
  describe('Tier 4: Scenario 1 — Happy Path End-to-End Collaboration Lifecycle', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('Executes entire collaboration lifecycle from creation to payout & mutual reviews', async () => {
      // -----------------------------------------------------------
      // STEP 1: Business creates & publishes new campaign
      // -----------------------------------------------------------
      ctx.asVerifiedBusiness();
      const createCampRes = await ctx.api.createCampaign({
        title: 'Next-Gen Wireless Earbuds Mega Showcase',
        description: 'Detailed active noise cancellation and sound quality review reel + YouTube short.',
        budgetMin: 40000,
        budgetMax: 60000,
        budgetType: BudgetType.RANGE,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.YOUTUBE_SHORTS],
        creatorCategories: ['Technology', 'Audio'],
        requiredPlatforms: ['INSTAGRAM', 'YOUTUBE'],
        minFollowers: 50000,
        maxRevisions: 2,
        autoApproveAfterDays: 5,
      });
      DomainAssertions.assertStatus(createCampRes, 201);
      const campaignId = createCampRes.data.id;

      // -----------------------------------------------------------
      // STEP 2: Creator discovers campaign and applies with pitch
      // -----------------------------------------------------------
      ctx.asVerifiedCreator();
      const discoveryRes = await ctx.api.getCampaigns({ search: 'Wireless Earbuds' });
      DomainAssertions.assertStatus(discoveryRes, 200);
      expect(discoveryRes.data).toHaveLength(1);

      const applyRes = await ctx.api.applyForCampaign({
        campaignId,
        offeredAmount: 52000,
        bidMessage: 'Hi! I have 150k tech audience with 4.8% engagement. I can deliver 4K studio quality video in 5 days.',
      });
      DomainAssertions.assertStatus(applyRes, 201);
      const collabId = applyRes.data.id;
      DomainAssertions.assertCollaborationState(applyRes.data, CollaborationStatus.NEGOTIATING);

      // -----------------------------------------------------------
      // STEP 3: Real-time negotiation and price agreement
      // -----------------------------------------------------------
      // Business counters with 48,000 INR
      ctx.asVerifiedBusiness();
      const counterRes = await ctx.api.counterOffer(collabId, {
        amount: 48000,
        message: 'We love your portfolio! Can we do 48,000 INR for the reel + short package?',
      });
      DomainAssertions.assertStatus(counterRes, 200);

      // Creator accepts counter-offer
      ctx.asVerifiedCreator();
      const acceptRes = await ctx.api.acceptOffer(collabId);
      DomainAssertions.assertStatus(acceptRes, 200);
      DomainAssertions.assertCollaborationState(acceptRes.data, CollaborationStatus.ACCEPTED);
      expect(acceptRes.data.agreedAmount).toBe(48000);

      // -----------------------------------------------------------
      // STEP 4: Business locks payment into Escrow via Razorpay
      // -----------------------------------------------------------
      ctx.asVerifiedBusiness();
      const escrowRes = await ctx.api.lockPaymentEscrow(collabId);
      DomainAssertions.assertStatus(escrowRes, 200);
      DomainAssertions.assertCollaborationState(escrowRes.data.collaboration, CollaborationStatus.IN_PROGRESS);
      DomainAssertions.assertPaymentStatus(escrowRes.data.payment, PaymentStatus.ESCROW_HELD);

      // Verify financial breakdown: 10% fee = 4800, net payout = 43200
      DomainAssertions.assertFeeCalculation(
        escrowRes.data.payment.grossAmount,
        escrowRes.data.payment.platformFeeAmount,
        escrowRes.data.payment.netAmountToCreator,
        10
      );
      expect(escrowRes.data.payment.grossAmount).toBe(48000);
      expect(escrowRes.data.payment.platformFeeAmount).toBe(4800);
      expect(escrowRes.data.payment.netAmountToCreator).toBe(43200);

      // -----------------------------------------------------------
      // STEP 5: Creator executes and submits deliverables
      // -----------------------------------------------------------
      ctx.asVerifiedCreator();
      const submitRes = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/C_earbuds_anc_test_01',
          notes: 'High-energy noise cancelling comparison test with studio sound.',
        },
        {
          type: DeliverableType.YOUTUBE_SHORTS,
          url: 'https://youtube.com/shorts/earbuds_unboxing_01',
          notes: 'Clean aesthetic unboxing short.',
        },
      ]);
      DomainAssertions.assertStatus(submitRes, 200);
      DomainAssertions.assertCollaborationState(submitRes.data, CollaborationStatus.DELIVERABLE_SUBMITTED);
      expect(submitRes.data.deliverableLinks).toHaveLength(2);

      // -----------------------------------------------------------
      // STEP 6: Business reviews and approves deliverables
      // -----------------------------------------------------------
      ctx.asVerifiedBusiness();
      const approveRes = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertStatus(approveRes, 200);
      DomainAssertions.assertCollaborationState(approveRes.data.collaboration, CollaborationStatus.PAID_OUT);

      // Escrow released to creator
      const paymentRecord = ctx.db.getPaymentByCollaborationId(collabId)!;
      DomainAssertions.assertPaymentStatus(paymentRecord, PaymentStatus.RELEASED);
      expect(paymentRecord.releasedAt).toBeTruthy();

      // -----------------------------------------------------------
      // STEP 7: Mutual Ratings & Reviews
      // -----------------------------------------------------------
      // Business reviews Creator
      ctx.asVerifiedBusiness();
      const bizReviewRes = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        criteriaRatings: {
          contentQuality: 5,
          communication: 5,
          turnaroundTime: 5,
          brandAlignment: 5,
        },
        comment: 'Aarav produced world-class content! Engagement on the reel surpassed our expectations.',
      });
      DomainAssertions.assertStatus(bizReviewRes, 201);

      // Creator reviews Business
      ctx.asVerifiedCreator();
      const creatorReviewRes = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        criteriaRatings: {
          briefClarity: 5,
          paymentPromptness: 5,
          professionalism: 5,
        },
        comment: 'Exceptional brand partner! Clear specifications and instant milestone approval.',
      });
      DomainAssertions.assertStatus(creatorReviewRes, 201);

      // -----------------------------------------------------------
      // STEP 8: Administrative Platform Audit & Ledger Check
      // -----------------------------------------------------------
      ctx.asAdmin();
      const analytics = await ctx.api.getAnalyticsOverview();
      DomainAssertions.assertStatus(analytics, 200);
      expect(analytics.data?.gmv).toBeGreaterThanOrEqual(48000);
      expect(analytics.data?.platformRevenue).toBeGreaterThanOrEqual(4800);
      expect(analytics.data?.totalCollaborations).toBeGreaterThanOrEqual(1);
    });
  });
}
