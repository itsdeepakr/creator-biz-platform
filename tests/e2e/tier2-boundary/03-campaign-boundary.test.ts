/**
 * Tier 2: Boundary & Corner Cases — Campaign Management
 */

import { describe, it, beforeEach } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { DeliverableType } from '../harness/types.ts';

export function runCampaignBoundaryTests(ctx: TestContext): void {
  describe('Tier 2: Campaign Management Boundary Cases', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T2.03.1 - Rejects negative minimum budget', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.createCampaign({
        title: 'Negative Budget Campaign',
        description: 'Should fail',
        budgetMin: -5000,
        budgetMax: 20000,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      });

      DomainAssertions.assertValidationError(res, 'budget');
    });

    it('T2.03.2 - Rejects maximum budget smaller than minimum budget', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.createCampaign({
        title: 'Inverted Budget Range Campaign',
        description: 'Should fail',
        budgetMin: 50000,
        budgetMax: 20000,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      });

      DomainAssertions.assertValidationError(res, 'budget');
    });

    it('T2.03.3 - Rejects campaign creation with empty deliverable types array', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.createCampaign({
        title: 'Empty Deliverables Campaign',
        description: 'Should fail',
        budgetMin: 10000,
        budgetMax: 20000,
        deliverableTypes: [],
      });

      DomainAssertions.assertValidationError(res, 'deliverable');
    });

    it('T2.03.4 - Rejects campaign title shorter than 5 characters', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.createCampaign({
        title: 'Abc',
        description: 'Short title',
        budgetMin: 10000,
        budgetMax: 20000,
        deliverableTypes: [DeliverableType.INSTAGRAM_REEL],
      });

      DomainAssertions.assertValidationError(res, 'title');
    });

    it('T2.03.5 - Prevents non-owner business from modifying another business campaign', async () => {
      // Business 2 attempts to edit Business 1's campaign
      ctx.asUnverifiedBusiness();
      const res = await ctx.api.updateCampaign(ctx.seeds.activeCampaign.id, {
        description: 'Malicious unauthorized modification',
      });

      DomainAssertions.assertForbidden(res);
    });
  });
}
