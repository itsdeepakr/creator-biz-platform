/**
 * Tier 2: Boundary & Corner Cases — Admin Moderation & Security
 */

import { describe, it, beforeEach } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';

export function runAdminBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Admin Moderation & Security Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.10.1 - Prevents Creator from accessing admin KYC queue', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.getPendingKycQueue();
      DomainAssertions.assertForbidden(res);
    });

    it('T2.10.2 - Prevents Business from accessing admin KYC queue', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.getPendingKycQueue();
      DomainAssertions.assertForbidden(res);
    });

    it('T2.10.3 - Prevents unauthenticated user from accessing admin analytics overview', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.getAnalyticsOverview();
      DomainAssertions.assertUnauthorized(res);
    });

    it('T2.10.4 - Rejects approving KYC for non-existent user ID with 404 Not Found', async () => {
      ctx.asAdmin();
      const res = await ctx.api.approveKyc('usr_missing_9999');
      DomainAssertions.assertNotFound(res);
    });

    it('T2.10.5 - Rejects banning non-existent user ID with 404 Not Found', async () => {
      ctx.asAdmin();
      const res = await ctx.api.banUser('usr_missing_9999', true, 'Ghost user ban');
      DomainAssertions.assertNotFound(res);
    });
  });
}
