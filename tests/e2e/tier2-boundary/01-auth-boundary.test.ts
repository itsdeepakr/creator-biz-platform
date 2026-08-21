/**
 * Tier 2: Boundary & Corner Cases — Auth & RBAC Security
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { UserRole } from '../harness/types.ts';

export function runAuthBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Auth & RBAC Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.01.1 - Rejects registration with invalid email format', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.register({
        email: 'invalid-email-format-without-at',
        password: 'password123',
        displayName: 'Test User',
        role: UserRole.CREATOR,
      });

      DomainAssertions.assertValidationError(res, 'email');
    });

    it('T2.01.2 - Rejects registration with short password (<6 characters)', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.register({
        email: 'validuser@test.com',
        password: '123',
        displayName: 'Test User',
        role: UserRole.CREATOR,
      });

      DomainAssertions.assertValidationError(res, 'password');
    });

    it('T2.01.3 - Rejects registration missing required fields', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.register({
        email: 'validuser@test.com',
        password: 'password123',
        displayName: '',
        role: UserRole.CREATOR,
      });

      DomainAssertions.assertValidationError(res, 'display name');
    });

    it('T2.01.4 - Rejects duplicate email registration with 409 Conflict', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.register({
        email: ctx.seeds.businessVerified.email,
        password: 'password123',
        displayName: 'Duplicate Biz',
        role: UserRole.BUSINESS,
      });

      DomainAssertions.assertConflict(res);
      expect(res.error).toContain('already registered');
    });

    it('T2.01.5 - Rejects login with non-existent user email with 401 Unauthorized', async () => {
      ctx.asAnonymous();
      const res = await ctx.api.login({
        email: 'nonexistent_ghost_user@creatorbiz.com',
        password: 'random_password_123',
      });

      DomainAssertions.assertUnauthorized(res);
    });
  });
}
