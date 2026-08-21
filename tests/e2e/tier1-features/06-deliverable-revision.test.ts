/**
 * Tier 1: Feature Coverage — Deliverable Submission & Revision Cycle
 * Requirements: ORIGINAL_REQUEST §R1, R3, R4, PROJECT.md F06
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { CollaborationStatus, DeliverableType } from '../harness/types.ts';

export function runDeliverableRevisionTests(ctx: TestContext): void {
  describe('Tier 1: Deliverable Submission & Revision Cycle', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.06.1 - Creator submits deliverable proof links -> DELIVERABLE_SUBMITTED', async () => {
      // 1. Setup in-progress collaboration
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // 2. Creator submits deliverables
      ctx.asVerifiedCreator();
      const submitRes = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/C8_demo_video_01',
          notes: 'Draft 1 uploaded with brand hashtag and mention in bio.',
        },
        {
          type: DeliverableType.YOUTUBE_SHORTS,
          url: 'https://youtube.com/shorts/demo_short_01',
          notes: 'Vertical unboxing short.',
        },
      ]);

      DomainAssertions.assertStatus(submitRes, 200);
      DomainAssertions.assertCollaborationState(submitRes.data, CollaborationStatus.DELIVERABLE_SUBMITTED);
      expect(submitRes.data.deliverableLinks).toHaveLength(2);
      expect(submitRes.data.submittedAt).toBeTruthy();
    });

    it('T1.06.2 - Business requests revision with specific notes -> REVISION_REQUESTED', async () => {
      // Setup submitted collaboration
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [
        { type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' },
      ]);

      // Business requests revision
      ctx.asVerifiedBusiness();
      const revRes = await ctx.api.requestRevision(collabId, 'Please make the brand logo visible in the first 3 seconds of the reel.');

      DomainAssertions.assertStatus(revRes, 200);
      DomainAssertions.assertCollaborationState(revRes.data, CollaborationStatus.REVISION_REQUESTED);
      expect(revRes.data.revisionCount).toBe(1);
      expect(revRes.data.revisionRequest).toContain('brand logo visible');
    });

    it('T1.06.3 - Creator resubmits deliverables after revision request', async () => {
      // Setup revision requested
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [
        { type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' },
      ]);

      ctx.asVerifiedBusiness();
      await ctx.api.requestRevision(collabId, 'Fix audio sync');

      // Creator resubmits
      ctx.asVerifiedCreator();
      const resubmitRes = await ctx.api.submitDeliverables(collabId, [
        {
          type: DeliverableType.INSTAGRAM_REEL,
          url: 'https://instagram.com/reel/1_v2',
          notes: 'Audio synced and logo added at 0:02.',
        },
      ]);

      DomainAssertions.assertStatus(resubmitRes, 200);
      DomainAssertions.assertCollaborationState(resubmitRes.data, CollaborationStatus.DELIVERABLE_SUBMITTED);
      expect(resubmitRes.data.deliverableLinks.length).toBeGreaterThanOrEqual(2);
    });

    it('T1.06.4 - Increments revisionCount accurately across multiple revision rounds', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Round 1
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);
      ctx.asVerifiedBusiness();
      const rev1 = await ctx.api.requestRevision(collabId, 'Revision 1 note');
      expect(rev1.data.revisionCount).toBe(1);

      // Round 2
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/2' }]);
      ctx.asVerifiedBusiness();
      const rev2 = await ctx.api.requestRevision(collabId, 'Revision 2 note');
      expect(rev2.data.revisionCount).toBe(2);
    });

    it('T1.06.5 - Prevents exceeding maximum revision limit (maxRevisions = 2)', async () => {
      ctx.asVerifiedCreator();
      const applyRes = await ctx.api.applyForCampaign({
        campaignId: ctx.seeds.activeCampaign.id,
        offeredAmount: 45000,
      });
      const collabId = applyRes.data.id;

      ctx.asVerifiedBusiness();
      await ctx.api.acceptOffer(collabId);
      await ctx.api.lockPaymentEscrow(collabId);

      // Revision 1
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/1' }]);
      ctx.asVerifiedBusiness();
      await ctx.api.requestRevision(collabId, 'Rev 1');

      // Revision 2
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/2' }]);
      ctx.asVerifiedBusiness();
      await ctx.api.requestRevision(collabId, 'Rev 2');

      // Resubmit after revision 2
      ctx.asVerifiedCreator();
      await ctx.api.submitDeliverables(collabId, [{ type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/3' }]);

      // Attempt Revision 3 (exceeds maxRevisions: 2) -> 400 Bad Request
      ctx.asVerifiedBusiness();
      const rev3 = await ctx.api.requestRevision(collabId, 'Rev 3 attempt');
      DomainAssertions.assertBadRequest(rev3);
      expect(rev3.error).toContain('Maximum revision limit');
    });
  });
}
