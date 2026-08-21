/**
 * CHALLENGER ADVERSARIAL STRESS TEST SUITE
 * Stress-tests negative funds, illegal status transitions, role violations,
 * anti-disintermediation evasion, dispute split invariants, and multi-tenant safety.
 */

import { describe, it, expect, beforeEach } from './harness/test-framework.ts';
import { TestContext } from './harness/test-context.ts';
import {
  UserRole,
  DeliverableType,
  CollaborationStatus,
  DisputeStatus,
  DisputeResolution,
} from './harness/types.ts';
import {
  canTransition,
  assertValidTransition,
  CollaborationTransitionError,
  PLATFORM_FEE_PERCENTAGE,
} from '../../packages/shared/dist/index.js';

const ctx = new TestContext();

// =========================================================================
// 1. NEGATIVE FUNDS & NUMERICAL BOUNDARY ATTACKS
// =========================================================================
describe('Adversarial 1: Negative Funds & Monetary Numerical Integrity', () => {
  beforeEach(() => {
    ctx.reset();
  });

  it('should reject negative minimum budget on campaign creation', async () => {
    ctx.asVerifiedBusiness();
    const res = await ctx.api.createCampaign({
      title: 'Negative Budget Test',
      description: 'Testing adversarial negative budget input',
      budgetMin: -5000,
      budgetMax: 10000,
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
    });
    expect(res.statusCode).toBe(400);
    expect(res.success).toBe(false);
    expect(res.error).toContain('negative');
  });

  it('should reject negative maximum budget on campaign creation', async () => {
    ctx.asVerifiedBusiness();
    const res = await ctx.api.createCampaign({
      title: 'Negative Max Budget Test',
      description: 'Testing adversarial negative budget input',
      budgetMin: 1000,
      budgetMax: -10000,
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
    });
    expect(res.statusCode).toBe(400);
    expect(res.success).toBe(false);
    expect(res.error).toContain('negative');
  });

  it('should reject max budget strictly smaller than min budget', async () => {
    ctx.asVerifiedBusiness();
    const res = await ctx.api.createCampaign({
      title: 'Inverted Budget Range Campaign',
      description: 'Testing min > max budget inverted bounds',
      budgetMin: 50000,
      budgetMax: 10000,
      deliverableTypes: [DeliverableType.YOUTUBE_VIDEO],
    });
    expect(res.statusCode).toBe(400);
    expect(res.success).toBe(false);
    expect(res.error).toContain('greater than or equal to minimum');
  });

  it('should reject zero or negative creator bids', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;

    const resZero = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 0,
      bidMessage: 'Zero bid exploit attempt',
    });
    expect(resZero.statusCode).toBe(400);
    expect(resZero.success).toBe(false);

    const resNeg = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: -25000,
      bidMessage: 'Negative bid exploit attempt',
    });
    expect(resNeg.statusCode).toBe(400);
    expect(resNeg.success).toBe(false);
  });

  it('should reject zero or negative counter-offers in negotiation', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 30000,
      bidMessage: 'Legitimate initial bid',
    });
    expect(applyRes.statusCode).toBe(201);
    const collabId = applyRes.data.id;

    // Business counters with zero or negative price
    ctx.asVerifiedBusiness();
    const counterZero = await ctx.api.counterOffer(collabId, {
      amount: 0,
      message: 'Zero counter offer',
    });
    expect(counterZero.statusCode).toBe(400);
    expect(counterZero.success).toBe(false);

    const counterNeg = await ctx.api.counterOffer(collabId, {
      amount: -5000,
      message: 'Negative counter offer',
    });
    expect(counterNeg.statusCode).toBe(400);
    expect(counterNeg.success).toBe(false);
  });

  it('should reject dispute resolution where split sum exceeds gross escrow amount', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 40000,
    });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    // Raise dispute
    const dispRes = await ctx.api.raiseDispute({
      collaborationId: collabId,
      category: 'QUALITY',
      reason: 'Deliverable did not meet brief',
    });
    expect(dispRes.statusCode).toBe(201);
    const disputeId = dispRes.data.id;

    // Admin attempts illegal over-allocation split (gross = 40000, split = 30000 + 20000 = 50000)
    ctx.asAdmin();
    const overSplit = await ctx.api.resolveDispute(disputeId, {
      resolution: DisputeResolution.PARTIAL_SPLIT,
      refundAmount: 30000,
      payoutAmount: 20000,
      notes: 'Over-allocated split',
    });
    expect(overSplit.statusCode).toBe(400);
    expect(overSplit.success).toBe(false);
    expect(overSplit.error).toContain('cannot exceed total escrow');
  });

  it('should maintain mathematical conservation of funds across 50 arbitrary split combinations', () => {
    const grossEscrow = 100000;
    for (let i = 0; i <= 50; i++) {
      const creatorRatio = i / 50;
      const businessRatio = 1 - creatorRatio;
      const creatorGross = Math.round(grossEscrow * creatorRatio * 100) / 100;
      const businessRefund = Math.round(grossEscrow * businessRatio * 100) / 100;

      expect(creatorGross + businessRefund).toBeLessThanOrEqual(grossEscrow + 0.01);
      const fee = Math.round(creatorGross * (PLATFORM_FEE_PERCENTAGE / 100) * 100) / 100;
      const netCreator = Math.round((creatorGross - fee) * 100) / 100;
      expect(netCreator + fee).toBeLessThanOrEqual(creatorGross + 0.01);
    }
  });
});

// =========================================================================
// 2. ILLEGAL STATUS TRANSITIONS & LIFECYCLE BYPASSES
// =========================================================================
describe('Adversarial 2: Illegal State Machine Transitions & State Tampering', () => {
  beforeEach(() => {
    ctx.reset();
  });

  it('should enforce terminal state immutability (COMPLETED, CANCELLED, REFUNDED, DECLINED)', () => {
    const terminalStates = [
      CollaborationStatus.COMPLETED,
      CollaborationStatus.CANCELLED,
      CollaborationStatus.DECLINED,
      CollaborationStatus.REFUNDED,
    ];
    const allStates = Object.values(CollaborationStatus);

    for (const term of terminalStates) {
      for (const target of allStates) {
        expect(canTransition(term as any, target as any)).toBe(false);
        expect(() => assertValidTransition(term as any, target as any)).toThrow(CollaborationTransitionError);
      }
    }
  });

  it('should reject deliverable submission before escrow is locked', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 20000,
    });
    const collabId = applyRes.data.id;

    // Try submitting deliverables while still in NEGOTIATING
    const submitNeg = await ctx.api.submitDeliverables(collabId, [
      { type: DeliverableType.INSTAGRAM_POST, url: 'https://cdn.test.com/post1.mp4' },
    ]);
    expect(submitNeg.statusCode).toBe(400);
    expect(submitNeg.success).toBe(false);

    // Accept offer, but do NOT fund escrow yet (state: ACCEPTED)
    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);

    ctx.asVerifiedCreator();
    const submitAcc = await ctx.api.submitDeliverables(collabId, [
      { type: DeliverableType.INSTAGRAM_POST, url: 'https://cdn.test.com/post1.mp4' },
    ]);
    expect(submitAcc.statusCode).toBe(400);
    expect(submitAcc.success).toBe(false);
  });

  it('should reject deliverable approval before deliverables are submitted', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 20000,
    });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    // In IN_PROGRESS, but creator hasn't submitted yet
    const approvePremature = await ctx.api.approveDeliverables(collabId);
    expect(approvePremature.statusCode).toBe(400);
    expect(approvePremature.success).toBe(false);
  });

  it('should reject revisions exceeding maximum allowed revision count', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign; // maxRevisions = 2
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 25000,
    });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    // Round 1: Submit -> Revision 1
    ctx.asVerifiedCreator();
    await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://cdn.test.com/v1.mp4' }]);
    ctx.asVerifiedBusiness();
    const rev1 = await ctx.api.requestRevision(collabId, 'Fix lighting');
    expect(rev1.statusCode).toBe(200);

    // Round 2: Submit -> Revision 2
    ctx.asVerifiedCreator();
    await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://cdn.test.com/v2.mp4' }]);
    ctx.asVerifiedBusiness();
    const rev2 = await ctx.api.requestRevision(collabId, 'Fix audio sync');
    expect(rev2.statusCode).toBe(200);

    // Round 3: Submit -> Revision 3 (Limit Reached: maxRevisions is 2)
    ctx.asVerifiedCreator();
    await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://cdn.test.com/v3.mp4' }]);
    ctx.asVerifiedBusiness();
    const rev3 = await ctx.api.requestRevision(collabId, 'Fix caption font');
    expect(rev3.statusCode).toBe(400);
    expect(rev3.success).toBe(false);
    expect(rev3.error).toContain('Maximum revision limit');
  });

  it('should reject raising disputes on settled and paid out collaborations', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 20000,
    });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    ctx.asVerifiedCreator();
    await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_POST, url: 'https://cdn.test.com/p.jpg' }]);

    ctx.asVerifiedBusiness();
    await ctx.api.approveDeliverables(collabId);

    // Attempt to dispute after approval and payout
    const disputeAttempt = await ctx.api.raiseDispute({
      collaborationId: collabId,
      category: 'LATE_DELIVERY',
      reason: 'Post-settlement regret dispute',
    });
    expect(disputeAttempt.statusCode).toBe(400);
    expect(disputeAttempt.success).toBe(false);
    expect(disputeAttempt.error).toContain('final state');
  });
});

// =========================================================================
// 3. ROLE VIOLATIONS & MULTI-TENANT AUTHORIZATION
// =========================================================================
describe('Adversarial 3: Role Authorization Matrix & Multi-Tenant Isolation', () => {
  beforeEach(() => {
    ctx.reset();
  });

  it('should reject unauthenticated requests across all sensitive endpoints', async () => {
    ctx.asAnonymous();

    const r1 = await ctx.api.getMe();
    expect(r1.statusCode).toBe(401);

    const r2 = await ctx.api.submitCreatorKyc({
      panNumber: 'ABCPS1234K',
      bankAccountNumber: '123456789012',
      bankIfsc: 'HDFC0000123',
      bankAccountHolderName: 'Test',
    });
    expect(r2.statusCode).toBe(401);

    const r3 = await ctx.api.createCampaign({
      title: 'Unauthorized Campaign',
      description: 'test',
      budgetMin: 10000,
      budgetMax: 20000,
      deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
    });
    expect(r3.statusCode).toBe(401);

    const r4 = await ctx.api.getPendingKycQueue();
    expect(r4.statusCode).toBe(401);
  });

  it('should prevent CREATOR from executing privileged BUSINESS or ADMIN actions', async () => {
    ctx.asVerifiedCreator();

    // Creator cannot lock escrow
    const r1 = await ctx.api.lockPaymentEscrow('collab_dummy');
    expect(r1.statusCode).toBe(403);

    // Creator cannot approve deliverables
    const r2 = await ctx.api.approveDeliverables('collab_dummy');
    expect(r2.statusCode).toBe(403);

    // Creator cannot request revisions
    const r3 = await ctx.api.requestRevision('collab_dummy', 'Fix this');
    expect(r3.statusCode).toBe(403);

    // Creator cannot access admin KYC queue
    const r4 = await ctx.api.getPendingKycQueue();
    expect(r4.statusCode).toBe(403);

    // Creator cannot resolve disputes
    const r5 = await ctx.api.resolveDispute('disp_dummy', {
      resolution: DisputeResolution.CREATOR,
      notes: 'Self-grant payout',
    });
    expect(r5.statusCode).toBe(403);

    // Creator cannot ban users
    const r6 = await ctx.api.banUser('user_dummy', true);
    expect(r6.statusCode).toBe(403);
  });

  it('should prevent BUSINESS from executing CREATOR-only actions', async () => {
    ctx.asVerifiedBusiness();

    // Business cannot submit creator KYC
    const r1 = await ctx.api.submitCreatorKyc({
      panNumber: 'ABCPS1234K',
      bankAccountNumber: '123456789012',
      bankIfsc: 'HDFC0000123',
      bankAccountHolderName: 'Test',
    });
    expect(r1.statusCode).toBe(403);

    // Business cannot submit deliverables
    const r2 = await ctx.api.submitDeliverables('collab_dummy', [
      { type: DeliverableType.INSTAGRAM_REEL, url: 'https://cdn.test.com/v.mp4' },
    ]);
    expect(r2.statusCode).toBe(403);

    // Business cannot apply to campaigns
    const r3 = await ctx.api.applyForCampaign({
      campaignId: 'camp_dummy',
      offeredAmount: 10000,
    });
    expect(r3.statusCode).toBe(403);
  });

  it('should prevent tenant cross-talk: Business A cannot fund/approve Business B collaboration', async () => {
    // Creator applies to Business 1 campaign
    ctx.asVerifiedCreator();
    const campaignB1 = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaignB1.id,
      offeredAmount: 20000,
    });
    const collabId = applyRes.data.id;

    // Business 2 (user_biz_unverified_02) attempts to accept/fund/approve Business 1's collaboration
    ctx.asUnverifiedBusiness();
    const rogueAccept = await ctx.api.acceptOffer(collabId);
    expect(rogueAccept.statusCode).toBe(403);

    const rogueFund = await ctx.api.lockPaymentEscrow(collabId);
    expect(rogueFund.statusCode).toBe(403);

    const rogueApprove = await ctx.api.approveDeliverables(collabId);
    expect(rogueApprove.statusCode).toBe(403);
  });
});

// =========================================================================
// 4. ANTI-DISINTERMEDIATION KEYWORD & EVASION STRESS TEST
// =========================================================================
describe('Adversarial 4: Anti-Disintermediation Chat Safety & Keyword Evasion Scanner', () => {
  beforeEach(() => {
    ctx.reset();
  });

  const maliciousMessages = [
    'Call me directly at 9820112233 to discuss payment',
    'My number is +91 98201 12233 ping me',
    'Reach me at 09820112233',
    'Contact: 98201-12233',
    'Email me at creator.biz@gmail.com for offline deal',
    'Send details to partner+brand@subdomain.company.co.in',
    'Let us chat on whatsapp wa.me/919820112233',
    'Message me on telegram t.me/topcreator',
    'Can you gpay me directly instead of escrow?',
    'Send to my paytm or phonepe number',
    'My upi id is creator@okaxis please transfer here',
    'Let us do direct transfer outside to avoid escrow fee',
  ];


  const legitimateMessages = [
    'I have reviewed your creative brief for the Summer Fashion Campaign.',
    'Here is the Google Drive link to the raw footage as requested.',
    'The Instagram Reel has been posted with the required brand tags and hashtags.',
    'Can you please confirm if we should include product feature bullet points in the caption?',
    'Thank you for approving the deliverables, looking forward to future collaborations!',
  ];

  it('should detect and flag all off-platform disintermediation attempts via WebSocket simulator', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 40000,
    });
    const collabId = applyRes.data.id;
    const thread = ctx.db.getChatThreadByParticipants(ctx.seeds.creatorVerified.id, ctx.seeds.businessVerified.id)!;
    expect(thread).toBeDefined();

    ctx.ws.connect(ctx.seeds.creatorVerified.token);
    ctx.ws.joinThread(thread.id);

    for (const text of maliciousMessages) {
      const msg = ctx.ws.sendMessage({
        threadId: thread.id,
        senderId: ctx.seeds.creatorVerified.id,
        content: text,
      });
      expect(msg.isFlagged).toBe(true);
      expect(msg.flagReason).toBeDefined();
    }
  });

  it('should never false-positive on standard legitimate collaboration chat messages', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({
      campaignId: campaign.id,
      offeredAmount: 40000,
    });
    const collabId = applyRes.data.id;
    const thread = ctx.db.getChatThreadByParticipants(ctx.seeds.creatorVerified.id, ctx.seeds.businessVerified.id)!;
    expect(thread).toBeDefined();

    ctx.ws.connect(ctx.seeds.creatorVerified.token);
    ctx.ws.joinThread(thread.id);

    for (const msgText of legitimateMessages) {
      const msg = ctx.ws.sendMessage({
        threadId: thread.id,
        senderId: ctx.seeds.creatorVerified.id,
        content: msgText,
      });
      expect(msg.isFlagged).toBe(false);
    }
  });
});

// =========================================================================
// 5. DISPUTE SPLIT CALCULATION & INVARIANT ARBITRATION
// =========================================================================
describe('Adversarial 5: Dispute Split Calculation & Arbitrated Settlement', () => {
  beforeEach(() => {
    ctx.reset();
  });

  it('Scenario: Full Business Refund (0% Creator, 100% Business)', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({ campaignId: campaign.id, offeredAmount: 50000 });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    const dispRes = await ctx.api.raiseDispute({
      collaborationId: collabId,
      category: 'NON_DELIVERY',
      reason: 'Creator never submitted deliverables',
    });
    const disputeId = dispRes.data.id;

    ctx.asAdmin();
    const res = await ctx.api.resolveDispute(disputeId, {
      resolution: DisputeResolution.BUSINESS,
      notes: 'Full refund to business due to total non-delivery',
    });
    expect(res.statusCode).toBe(200);
    expect(res.data.status).toBe(DisputeStatus.RESOLVED_BUSINESS);
    expect(res.data.refundAmount).toBe(50000);
    expect(res.data.payoutAmount).toBe(0);

    const collab = ctx.db.getCollaborationById(collabId);
    expect(collab?.status).toBe(CollaborationStatus.REFUNDED);
  });

  it('Scenario: Full Creator Payout (100% Creator, 0% Business)', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({ campaignId: campaign.id, offeredAmount: 50000 });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    ctx.asVerifiedCreator();
    await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://cdn.test.com/final.mp4' }]);

    // Creator disputes due to unresponsiveness
    const dispRes = await ctx.api.raiseDispute({
      collaborationId: collabId,
      category: 'UNRESPONSIVE',
      reason: 'Business ghosted post delivery',
    });
    const disputeId = dispRes.data.id;

    ctx.asAdmin();
    const res = await ctx.api.resolveDispute(disputeId, {
      resolution: DisputeResolution.CREATOR,
      notes: 'Full payout released to creator',
    });
    expect(res.statusCode).toBe(200);
    expect(res.data.status).toBe(DisputeStatus.RESOLVED_CREATOR);
    expect(res.data.payoutAmount).toBe(45000); // 50000 - 10% fee (5000) = 45000
    expect(res.data.refundAmount).toBe(0);

    const collab = ctx.db.getCollaborationById(collabId);
    expect(collab?.status).toBe(CollaborationStatus.PAID_OUT);
  });

  it('Scenario: Arbitrated Partial Split (60% Creator / 40% Business)', async () => {
    ctx.asVerifiedCreator();
    const campaign = ctx.seeds.activeCampaign;
    const applyRes = await ctx.api.applyForCampaign({ campaignId: campaign.id, offeredAmount: 50000 });
    const collabId = applyRes.data.id;

    ctx.asVerifiedBusiness();
    await ctx.api.acceptOffer(collabId);
    await ctx.api.lockPaymentEscrow(collabId);

    const dispRes = await ctx.api.raiseDispute({
      collaborationId: collabId,
      category: 'PARTIAL_COMPLETION',
      reason: 'Delivered 3 out of 5 stories',
    });
    const disputeId = dispRes.data.id;

    ctx.asAdmin();
    const res = await ctx.api.resolveDispute(disputeId, {
      resolution: DisputeResolution.PARTIAL_SPLIT,
      refundAmount: 20000,
      payoutAmount: 30000,
      notes: '60/40 proportional settlement based on partial deliverables',
    });
    expect(res.statusCode).toBe(200);
    expect(res.data.status).toBe(DisputeStatus.RESOLVED_PARTIAL);
    expect(res.data.refundAmount).toBe(20000);
    expect(res.data.payoutAmount).toBe(30000);
    expect(res.data.refundAmount + res.data.payoutAmount).toBe(50000);

    const collab = ctx.db.getCollaborationById(collabId);
    expect(collab?.status).toBe(CollaborationStatus.RESOLVED_PARTIAL);
  });
});

async function run() {
  const result = await (await import('./harness/test-framework.ts')).runnerContext.runAll(true);
  if (!result.passed) {
    process.exit(1);
  }
}
run();
