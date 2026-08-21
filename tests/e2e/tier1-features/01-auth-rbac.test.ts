/**
 * Tier 1: Feature Coverage — Auth & RBAC Security
 * Requirements: ORIGINAL_REQUEST §R1, PROJECT.md F03
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { UserRole, DeliverableType } from '../harness/types.ts';

export function runAuthRbacTests(ctx: TestContext): void {
  describe('Tier 1: Auth & RBAC Security', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.01.1 - Registers new Creator and Business accounts with initial profiles', async () => {
      ctx.asAnonymous();

      // Register Creator
      const creatorRes = await ctx.api.register({
        email: 'newcreator@test.com',
        password: 'password123',
        displayName: 'New Test Creator',
        role: UserRole.CREATOR,
        phone: '9876500001',
      });
      DomainAssertions.assertStatus(creatorRes, 201);
      expect(creatorRes.data?.user.email).toBe('newcreator@test.com');
      expect(creatorRes.data?.user.role).toBe(UserRole.CREATOR);
      expect(creatorRes.data?.token).toBeTruthy();

      // Register Business
      const bizRes = await ctx.api.register({
        email: 'newbusiness@test.com',
        password: 'password123',
        displayName: 'New Test Business Ltd',
        role: UserRole.BUSINESS,
        phone: '9876500002',
      });
      DomainAssertions.assertStatus(bizRes, 201);
      expect(bizRes.data?.user.email).toBe('newbusiness@test.com');
      expect(bizRes.data?.user.role).toBe(UserRole.BUSINESS);
    });

    it('T1.01.2 - Authenticates user with valid credentials and returns JWT token', async () => {
      ctx.asAnonymous();
      const loginRes = await ctx.api.login({
        email: ctx.seeds.businessVerified.email,
        password: 'hashed_biz1_pass_123',
      });

      DomainAssertions.assertStatus(loginRes, 200);
      expect(loginRes.data?.user.email).toBe(ctx.seeds.businessVerified.email);
      expect(loginRes.data?.user.role).toBe(UserRole.BUSINESS);
      expect(loginRes.data?.token).toContain('mock_jwt:');
    });

    it('T1.01.3 - Returns authenticated user profile via /auth/me', async () => {
      ctx.asVerifiedCreator();
      const meRes = await ctx.api.getMe();

      DomainAssertions.assertStatus(meRes, 200);
      expect(meRes.data?.email).toBe(ctx.seeds.creatorVerified.email);
      expect(meRes.data?.role).toBe(UserRole.CREATOR);
      expect(meRes.data?.profile).toBeDefined();
      expect(meRes.data?.profile?.category).toBe('Technology');
    });

    it('T1.01.4 - Issues fresh access token using valid refresh token', async () => {
      ctx.asVerifiedBusiness();
      const refreshRes = await ctx.api.refreshToken('valid_refresh_token_123');

      DomainAssertions.assertStatus(refreshRes, 200);
      expect(refreshRes.data?.token).toContain(ctx.seeds.businessVerified.id);
    });

    it('T1.01.5 - Enforces strict role-based access control (RBAC)', async () => {
      // 1. Creator attempts to create a campaign -> 403 Forbidden
      ctx.asVerifiedCreator();
      const creatorCampaignRes = await ctx.api.createCampaign({
        title: 'Unauthorized Creator Campaign',
        description: 'Should fail with 403',
        budgetMin: 10000,
        budgetMax: 20000,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      });
      DomainAssertions.assertForbidden(creatorCampaignRes);

      // 2. Business attempts to submit creator deliverables -> 403 Forbidden
      ctx.asVerifiedBusiness();
      const bizSubmitRes = await ctx.api.submitDeliverables('some_collab_id', [
        { type: DeliverableType.INSTAGRAM_REEL, url: 'https://instagram.com/reel/123' },
      ]);
      DomainAssertions.assertForbidden(bizSubmitRes);

      // 3. Admin can access platform moderation overview
      ctx.asAdmin();
      const adminRes = await ctx.api.getAnalyticsOverview();
      DomainAssertions.assertStatus(adminRes, 200);
    });
  });
}
