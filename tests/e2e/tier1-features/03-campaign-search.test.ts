/**
 * Tier 1: Feature Coverage — Campaign Creation & Search Filtering
 * Requirements: ORIGINAL_REQUEST §R1, R3, R4, PROJECT.md F05
 */

import { describe, it, beforeEach, expect } from '../harness/test-framework.ts';
import { TestContext } from '../harness/test-context.ts';
import { DomainAssertions } from '../harness/assertions.ts';
import { CampaignStatus, BudgetType, DeliverableType } from '../harness/types.ts';

export function runCampaignSearchTests(ctx: TestContext): void {
  describe('Tier 1: Campaign Creation & Search Filtering', () => {
    beforeEach(() => {
      ctx.reset();
    });

    it('T1.03.1 - Business creates a new multi-deliverable campaign', async () => {
      ctx.asVerifiedBusiness();
      const res = await ctx.api.createCampaign({
        title: 'New AI Laptop Unboxing & Benchmark',
        description: 'Comprehensive review highlighting battery life, AI benchmark scores, and build quality.',
        budgetMin: 45000,
        budgetMax: 75000,
        budgetType: BudgetType.RANGE,
        deliverableTypes: [DeliverableType.YOUTUBE_VIDEO, DeliverableType.INSTAGRAM_REEL],
        creatorCategories: ['Technology', 'Gaming'],
        requiredPlatforms: ['YOUTUBE', 'INSTAGRAM'],
        minFollowers: 25000,
        maxRevisions: 2,
        autoApproveAfterDays: 5,
      });

      DomainAssertions.assertStatus(res, 201);
      expect(res.data?.id).toBeTruthy();
      expect(res.data?.title).toBe('New AI Laptop Unboxing & Benchmark');
      expect(res.data?.status).toBe(CampaignStatus.ACTIVE);
      expect(res.data?.deliverableTypes).toHaveLength(2);
    });

    it('T1.03.2 - Creator discovers campaigns filtered by category', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.getCampaigns({ category: 'Technology' });

      DomainAssertions.assertStatus(res, 200);
      expect(res.data).toBeDefined();
      expect(res.data!.length).toBeGreaterThan(0);
      for (const c of res.data!) {
        expect(c.creatorCategories).toContain('Technology');
      }
    });

    it('T1.03.3 - Filters campaigns by budget range and deliverable type', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.getCampaigns({
        budgetMin: 25000,
        budgetMax: 70000,
        deliverableType: DeliverableType.INSTAGRAM_REEL,
      });

      DomainAssertions.assertStatus(res, 200);
      expect(res.data).toBeDefined();
      for (const c of res.data!) {
        expect(c.deliverableTypes).toContain(DeliverableType.INSTAGRAM_REEL);
        expect(c.budgetMax).toBeGreaterThanOrEqual(25000);
      }
    });

    it('T1.03.4 - Searches campaigns by keyword match in title and description', async () => {
      ctx.asVerifiedCreator();
      const res = await ctx.api.getCampaigns({ search: 'Smartphone' });

      DomainAssertions.assertStatus(res, 200);
      expect(res.data).toBeDefined();
      expect(res.data!.length).toBeGreaterThanOrEqual(1);
      expect(res.data![0].title).toContain('Smartphone');
    });

    it('T1.03.5 - Business owner updates campaign details and pauses campaign', async () => {
      ctx.asVerifiedBusiness();
      const campId = ctx.seeds.activeCampaign.id;

      const updateRes = await ctx.api.updateCampaign(campId, {
        status: CampaignStatus.PAUSED,
        description: 'Updated campaign brief with revised delivery milestones.',
      });

      DomainAssertions.assertStatus(updateRes, 200);
      expect(updateRes.data?.status).toBe(CampaignStatus.PAUSED);
      expect(updateRes.data?.description).toContain('revised delivery milestones');
    });
  });
}
