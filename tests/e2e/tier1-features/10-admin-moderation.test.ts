/**
 * Tier 1: Feature Coverage — Admin Portal Moderation & Analytics
 * Requirements: ORIGINAL_REQUEST §R2, PROJECT.md F11-F14
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { VerificationStatus, DeliverableType } from '../harness/types.ts';

export function runAdminModerationTests(ctx: TestContext): void {
  describe('Tier 1: Admin Portal Moderation & Analytics', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.10.1 - Admin queries pending KYC verification queue', async () => {
      ctx.asAdmin();
      const queueRes = await ctx.api.getPendingKycQueue();

      DomainAssertions.assertStatus(queueRes, 200);
      expect(queueRes.data?.creators).toBeDefined();
      expect(queueRes.data?.businesses).toBeDefined();
      expect(queueRes.data?.creators.length).toBeGreaterThanOrEqual(1);
      expect(queueRes.data?.businesses.length).toBeGreaterThanOrEqual(1);
    });

    it('T1.10.2 - Admin approves Creator KYC and updates verification status', async () => {
      ctx.asAdmin();
      const targetUserId = ctx.seeds.creatorUnverified.id;

      const approveRes = await ctx.api.approveKyc(targetUserId);
      DomainAssertions.assertStatus(approveRes, 200);

      const profile = ctx.db.getCreatorProfileByUserId(targetUserId);
      expect(profile?.verificationStatus).toBe(VerificationStatus.APPROVED);
      expect(profile?.isVerified).toBe(true);
    });

    it('T1.10.3 - Admin rejects Business KYC with mandatory rejection rationale', async () => {
      ctx.asAdmin();
      const targetUserId = ctx.seeds.businessUnverified.id;

      const rejectRes = await ctx.api.rejectKyc(targetUserId, 'GST certificate document was illegible / blurry.');
      DomainAssertions.assertStatus(rejectRes, 200);

      const profile = ctx.db.getBusinessProfileByUserId(targetUserId);
      expect(profile?.verificationStatus).toBe(VerificationStatus.REJECTED);
    });

    it('T1.10.4 - Admin retrieves platform analytics dashboard KPIs', async () => {
      // Simulate activity: complete a collaboration
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

      ctx.asVerifiedBusiness();
      await ctx.api.approveDeliverables(collabId);

      // Admin fetches KPIs
      ctx.asAdmin();
      const analytics = await ctx.api.getAnalyticsOverview();

      DomainAssertions.assertStatus(analytics, 200);
      expect(analytics.data?.gmv).toBeGreaterThanOrEqual(60000);
      expect(analytics.data?.platformRevenue).toBeGreaterThanOrEqual(6000);
      expect(analytics.data?.totalUsers).toBeGreaterThanOrEqual(5);
    });

    it('T1.10.5 - Admin suspends/bans abusive user account preventing login', async () => {
      ctx.asAdmin();
      const targetUserId = ctx.seeds.creatorUnverified.id;

      // Ban user
      const banRes = await ctx.api.banUser(targetUserId, true, 'Spam and off-platform solicitation violations.');
      DomainAssertions.assertStatus(banRes, 200);

      // Verify banned user cannot log in
      ctx.asAnonymous();
      const loginAttempt = await ctx.api.login({
        email: ctx.seeds.creatorUnverified.email,
        password: 'hashed_creator2_pass_123',
      });

      DomainAssertions.assertForbidden(loginAttempt);
      expect(loginAttempt.error).toContain('suspended or deactivated');
    });
  });
}
