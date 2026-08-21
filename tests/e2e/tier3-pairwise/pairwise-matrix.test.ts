/**
 * Tier 3: Cross-Feature Pairwise Combinatorial Tests
 * Requirements: TEST_INFRA.md Tier 3, 03-state-machine/collaboration-state-machine.md
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import {
  UserRole,
  VerificationStatus,
  CampaignStatus,
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
  DisputeResolution,
  DeliverableType,
  BudgetType,
} from '../harness/types.ts';

export function runPairwiseMatrixTests(ctx: TestContext): void {
  describe('Tier 3: Cross-Feature Pairwise Combinatorial Matrix', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T3.01 - Pairwise: Bidding Negotiation ↔ Real-time WebSocket Messaging', async () => {
      // 1. Creator applies to campaign
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
        bidMessage: 'Ready to produce quality tech reels.',
      });
      const collabId = applyRes.data.id;

      // 2. Both connect to WebSocket and join the collaboration chat thread
      const thread = ctx.db.getChatThreadByParticipants(ctx.seeds.creatorVerified.id, ctx.seeds.businessVerified.id)!;
      expect(thread).toBeDefined();

      ctx.ws.connect(ctx.seeds.creatorVerified.token);
      ctx.ws.joinThread(thread.id);

      // 3. Creator sends in-app chat message discussing timeline
      const msg1 = ctx.ws.sendMessage({
        threadId: thread.id,
        senderId: ctx.seeds.creatorVerified.id,
        content: 'Hi! I can shoot the unboxing this weekend. Can we agree on ₹45,000?',
      });
      expect(msg1.isFlagged).toBe(false);

      // 4. Business counters offer via REST API
      ctx.asVerifiedBusiness();
      const counterRes = await ctx.api.counterOffer(collabId, {
        amount: 45000,
        message: 'Agreed on 45,000 INR. Sending counter-offer now.',
      });
      DomainAssertions.assertStatus(counterRes, 200);

      // 5. Creator accepts counter-offer
      ctx.asVerifiedCreator();
      const acceptRes = await ctx.api.acceptOffer(collabId);
      DomainAssertions.assertCollaborationState(acceptRes.data, CollaborationStatus.ACCEPTED);
      expect(acceptRes.data.agreedAmount).toBe(45000);
    });

    it('T3.02 - Pairwise: Chat Anti-Disintermediation Safety ↔ Active Negotiation', async () => {
      // 1. Creator applies to campaign
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;
      const thread = ctx.db.getChatThreadByParticipants(ctx.seeds.creatorVerified.id, ctx.seeds.businessVerified.id)!;

      // 2. Creator attempts to send off-platform contact details (phone and WhatsApp)
      ctx.ws.connect(ctx.seeds.creatorVerified.token);
      ctx.ws.joinThread(thread.id);

      const flaggedMsg = ctx.ws.sendMessage({
        threadId: thread.id,
        senderId: ctx.seeds.creatorVerified.id,
        content: 'Hey, let us chat outside on WhatsApp at 9876543210 or call me directly!',
      });

      // Assert message was intercepted and flagged
      DomainAssertions.assertAntiDisintermediationFlag(flaggedMsg, 'phone');
      expect(flaggedMsg.isFlagged).toBe(true);

      // Thread warning counter incremented
      const updatedThread = ctx.db.getChatThreadById(thread.id);
      expect(updatedThread?.offPlatformContactDetected).toBe(true);
      expect(updatedThread?.warningCount).toBe(1);

      // State machine integrity preserved: collaboration still in valid NEGOTIATING state
      const collab = ctx.db.getCollaborationById(collabId);
      DomainAssertions.assertCollaborationState(collab!, CollaborationStatus.NEGOTIATING);
    });

    it('T3.03 - Pairwise: Business KYC Verification ↔ Campaign Creation & Discovery', async () => {
      // 1. Register brand new business (unverified)
      ctx.asAnonymous();
      const regRes = await ctx.api.register({
        email: 'greenenergy@startup.in',
        password: 'password123',
        displayName: 'GreenEnergy Mobility Pvt Ltd',
        role: UserRole.BUSINESS,
      });
      const newBizToken = regRes.data.token;
      const newBizId = regRes.data.user.id;

      // 2. Submit Business KYC with valid GST & PAN
      ctx.api.setAuthToken(newBizToken);
      const kycRes = await ctx.api.submitBusinessKyc({
        companyName: 'GreenEnergy Mobility Pvt Ltd',
        gstNumber: '29ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
      });
      DomainAssertions.assertStatus(kycRes, 200);

      // 3. Admin reviews and approves KYC
      ctx.asAdmin();
      await ctx.api.approveKyc(newBizId);

      // 4. Business creates campaign
      ctx.api.setAuthToken(newBizToken);
      const campRes = await ctx.api.createCampaign({
        title: 'EV Scooter Road Trip Reel Series',
        description: 'Influencer road trip testing real-world battery range and charging speed.',
        budgetMin: 50000,
        budgetMax: 90000,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL, DeliverableType.YOUTUBE_SHORTS],
        creatorCategories: ['Automobile', 'Travel'],
      });
      DomainAssertions.assertStatus(campRes, 201);
      const campId = campRes.data.id;

      // 5. Creator searches and discovers the newly published campaign
      ctx.asVerifiedCreator();
      const searchRes = await ctx.api.getCampaigns({ search: 'EV Scooter' });
      DomainAssertions.assertStatus(searchRes, 200);
      expect(searchRes.data).toHaveLength(1);
      expect(searchRes.data![0].id).toBe(campId);
    });

    it('T3.04 - Pairwise: Bidding Acceptance ↔ Cancellation Before Work Starts (10% Creator Penalty)', async () => {
      // Setup accepted collaboration before work starts
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 60000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);

      // Business cancels before work begins (Section 5: 90% refund to Business, 10% compensation to Creator)
      const cancelRes = await ctx.api.cancelCollaboration(collabId, 'Brand shifted launch quarter.');
      DomainAssertions.assertStatus(cancelRes, 200);
      DomainAssertions.assertCollaborationState(cancelRes.data.collaboration, CollaborationStatus.CANCELLED);

      // 10% of 60000 = 6000 compensation, 54000 refund
      expect(cancelRes.data.creatorPayout).toBe(6000);
      expect(cancelRes.data.refundAmount).toBe(54000);
    });

    it('T3.05 - Pairwise: In-Progress Collaboration ↔ Mid-Work Cancellation (50% Creator Compensation)', async () => {
      // Setup collaboration in progress
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 50000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Creator started work
      ctx.db.updateCollaboration(collabId, { inProgressAt: new Date() });

      // Business cancels after work started (Section 5: 50% refund, 50% creator payout)
      const cancelRes = await ctx.api.cancelCollaboration(collabId, 'Product recall event.');
      DomainAssertions.assertStatus(cancelRes, 200);
      DomainAssertions.assertCollaborationState(cancelRes.data.collaboration, CollaborationStatus.CANCELLED);

      // 50% of 50000 = 25000 payout, 25000 refund
      expect(cancelRes.data.creatorPayout).toBe(25000);
      expect(cancelRes.data.refundAmount).toBe(25000);
    });

    it('T3.06 - Pairwise: Revision Cycle ↔ Final Approval ↔ Mutual Ratings & Reviews', async () => {
      // Setup collaboration
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Draft 1
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/draft1' }]);

      // Revision 1
      ctx.asVerifiedBusiness();
      await ctx.api.requestRevision(collabId, 'Please brighten the opening shot.');

      // Draft 2 (Resubmission)
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/draft2_brightened' }]);

      // Business Approves
      ctx.asVerifiedBusiness();
      const approveRes = await ctx.api.approveDeliverables(collabId);
      DomainAssertions.assertCollaborationState(approveRes.data.collaboration, CollaborationStatus.PAID_OUT);

      // Mutual Reviews
      const bizReview = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        comment: 'Great adaptability on the revision request!',
      });
      DomainAssertions.assertStatus(bizReview, 201);

      ctx.asVerifiedCreator();
      const creatorReview = await ctx.api.submitReview({
        collaborationId: collabId,
        overallRating: 5,
        comment: 'Clear revision feedback, seamless release.',
      });
      DomainAssertions.assertStatus(creatorReview, 201);

      // Assert both reviews recorded
      const allReviews = ctx.db.listReviews((r) => r.collaborationId === collabId);
      expect(allReviews).toHaveLength(2);
    });

    it('T3.07 - Pairwise: Deliverable Submission ↔ Unresponsive Business ↔ Dispute ↔ Admin Full Creator Payout', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Creator delivers valid work
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/valid_content' }]);

      // Business is unresponsive; Creator raises dispute
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Non-responsive Business',
        reason: 'Business has not responded to approval request for 10 days.',
      });
      const disputeId = disputeRes.data.id;

      // Admin investigates and rules for Creator
      ctx.asAdmin();
      const resolveRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.CREATOR,
        notes: 'Deliverable meets all campaign guidelines; releasing payment.',
      });

      DomainAssertions.assertDisputeStatus(resolveRes.data, DisputeStatus.RESOLVED_CREATOR);
      const payment = ctx.db.getPaymentByCollaborationId(collabId);
      DomainAssertions.assertPaymentStatus(payment!, PaymentStatus.RELEASED);
      // Net payout = 45000 - 10% = 40500
      expect(payment?.netAmountToCreator).toBe(40500);
    });

    it('T3.08 - Pairwise: Multi-Creator Bidding on Same Campaign with Distinct Terms', async () => {
      ctx.asVerifiedBusiness();
      const campRes = await ctx.api.createCampaign({
        title: 'Diwali Festive Mega Campaign',
        description: 'Hiring multiple creators across different niches.',
        budgetMin: 30000,
        budgetMax: 100000,
        budgetType: BudgetType.RANGE,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
        creatorCategories: ['Technology', 'Lifestyle'],
      });
      const campId = campRes.data.id;

      // Creator 1 applies with 50k
      ctx.asVerifiedCreator();
      const apply1 = await ctx.api.applyForCampaign({ campaignId: campId, offeredAmount: 50000 });
      const collabId1 = apply1.data.id;

      // Creator 2 applies with 35k
      ctx.asUnverifiedCreator();
      const apply2 = await ctx.api.applyForCampaign({ campaignId: campId, offeredAmount: 35000 });
      const collabId2 = apply2.data.id;

      // Business accepts both
      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId1);
      await ctx.api.acceptOffer(collabId2);

      // Business locks escrow for both
      const escrow1 = await ctx.api.lockPaymentEscrow(collabId1);
      const escrow2 = await ctx.api.lockPaymentEscrow(collabId2);

      expect(escrow1.data.payment.grossAmount).toBe(50000);
      expect(escrow2.data.payment.grossAmount).toBe(35000);

      // Total escrow in hold is 85000
      ctx.asAdmin();
      const analytics = await ctx.api.getAnalyticsOverview();
      expect(analytics.data.escrowInHold).toBeGreaterThanOrEqual(85000);
    });

    it('T3.09 - Pairwise: Revision Limit Reached ↔ Dispute Escalation ↔ Partial Split Settlement', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 60000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Revision 1
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);
      ctx.asVerifiedBusiness();
      await ctx.api.requestRevision(collabId, 'Revision 1: Re-record voiceover');

      // Revision 2
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/2' }]);
      ctx.asVerifiedBusiness();
      await ctx.api.requestRevision(collabId, 'Revision 2: Re-edit cuts');

      // Resubmit after revision 2
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/3' }]);

      // Business is still unsatisfied, max revisions reached -> raises dispute
      ctx.asVerifiedBusiness();
      const disputeRes = await ctx.api.raiseDispute({
        collaborationId: collabId,
        category: 'Creative Disagreement',
        reason: 'Revision limit reached without achieving agreed brand tone.',
      });
      const disputeId = disputeRes.data.id;

      // Admin arbitrates with 60/40 split (₹36,000 to Creator, ₹24,000 refund to Business)
      ctx.asAdmin();
      const resolveRes = await ctx.api.resolveDispute(disputeId, {
        resolution: DisputeResolution.PARTIAL,
        refundAmount: 24000,
        payoutAmount: 36000,
        notes: 'Compensating creator for 3 production rounds while refunding business for unused creative assets.',
      });

      DomainAssertions.assertDisputeStatus(resolveRes.data, DisputeStatus.RESOLVED_PARTIAL);
      expect(resolveRes.data.refundAmount).toBe(24000);
      expect(resolveRes.data.payoutAmount).toBe(36000);
      expect(resolveRes.data.refundAmount + resolveRes.data.payoutAmount).toBe(60000);
    });

    it('T3.10 - Pairwise: User Banned Mid-Cycle ↔ Authentication & State Protection', async () => {
      // Creator applies
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 40000,
      });
      const collabId = applyRes.data.id;

      // Admin bans the Creator for platform terms violation
      ctx.asAdmin();
      await ctx.api.banUser(ctx.seeds.creatorVerified.id, true, 'Off-platform fee circumvention.');

      // Banned Creator attempts to accept or modify collaboration
      ctx.asVerifiedCreator();
      // Token is invalidated / active state blocked
      ctx.asAnonymous();
      const loginAttempt = await ctx.api.login({
        email: ctx.seeds.creatorVerified.email,
        password: 'hashed_creator1_pass_123',
      });
      DomainAssertions.assertForbidden(loginAttempt);
    });
  });
}
