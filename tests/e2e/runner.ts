/**
 * Centralized E2E Test Suite Runner
 * Executes all 4 Tiers of E2E Verification Tests:
 * - Tier 1: Feature Coverage Tests (10 suites, 50 tests)
 * - Tier 2: Boundary & Corner Case Tests (10 suites, 50 tests)
 * - Tier 3: Cross-Feature Pairwise Tests (1 suite, 10 tests)
 * - Tier 4: Real-World Multi-Actor Scenarios (7 suites, 9 tests)
 */

import { runnerContext } from './harness/test-framework.ts';
import { TestContext } from './harness/test-context.ts';

// Tier 1 Feature Coverage Suites
import { runAuthRbacTests } from './tier1-features/01-auth-rbac.test.ts';
import { runKycOnboardingTests } from './tier1-features/02-kyc-onboarding.test.ts';
import { runCampaignSearchTests } from './tier1-features/03-campaign-search.test.ts';
import { runBiddingNegotiationTests } from './tier1-features/04-bidding-negotiation.test.ts';
import { runEscrowFundingTests } from './tier1-features/05-escrow-funding.test.ts';
import { runDeliverableRevisionTests } from './tier1-features/06-deliverable-revision.test.ts';
import { runApprovalPayoutTests } from './tier1-features/07-approval-payout.test.ts';
import { runDisputeSplitTests } from './tier1-features/08-dispute-split.test.ts';
import { runReviewsRatingsTests } from './tier1-features/09-reviews-ratings.test.ts';
import { runAdminModerationTests } from './tier1-features/10-admin-moderation.test.ts';

// Tier 2 Boundary & Corner Case Suites
import { runAuthBoundaryTests } from './tier2-boundary/01-auth-boundary.test.ts';
import { runKycBoundaryTests } from './tier2-boundary/02-kyc-boundary.test.ts';
import { runCampaignBoundaryTests } from './tier2-boundary/03-campaign-boundary.test.ts';
import { runBiddingBoundaryTests } from './tier2-boundary/04-bidding-boundary.test.ts';
import { runEscrowBoundaryTests } from './tier2-boundary/05-escrow-boundary.test.ts';
import { runDeliverableBoundaryTests } from './tier2-boundary/06-deliverable-boundary.test.ts';
import { runApprovalBoundaryTests } from './tier2-boundary/07-approval-boundary.test.ts';
import { runDisputeBoundaryTests } from './tier2-boundary/08-dispute-boundary.test.ts';
import { runReviewsBoundaryTests } from './tier2-boundary/09-reviews-boundary.test.ts';
import { runAdminBoundaryTests } from './tier2-boundary/10-admin-boundary.test.ts';

// Tier 3 Pairwise Combinatorial Matrix
import { runPairwiseMatrixTests } from './tier3-pairwise/pairwise-matrix.test.ts';

// Tier 4 Real-World Scenario Lifecycles
import { runHappyPathLifecycleTests } from './tier4-scenarios/01-happy-path-lifecycle.test.ts';
import { runRevisionApprovalLifecycleTests } from './tier4-scenarios/02-revision-approval-lifecycle.test.ts';
import { runDisputeCreatorWinLifecycleTests } from './tier4-scenarios/03-dispute-creator-win-lifecycle.test.ts';
import { runDisputeBusinessRefundLifecycleTests } from './tier4-scenarios/04-dispute-business-refund-lifecycle.test.ts';
import { runDisputeSplitSettlementLifecycleTests } from './tier4-scenarios/05-dispute-split-settlement-lifecycle.test.ts';
import { runCancellationLifecycleTests } from './tier4-scenarios/06-cancellation-lifecycle.test.ts';
import { runMultiPartyConcurrentLifecycleTests } from './tier4-scenarios/07-multi-party-concurrent-lifecycle.test.ts';

async function main() {
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m    CREATOR-BUSINESS COLLABORATION PLATFORM — E2E TEST SUITE RUNNER  \x1b[0m');
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');

  const ctx = new TestContext();

  // Register Tier 1: Feature Coverage Suites
  runAuthRbacTests(ctx);
  runKycOnboardingTests(ctx);
  runCampaignSearchTests(ctx);
  runBiddingNegotiationTests(ctx);
  runEscrowFundingTests(ctx);
  runDeliverableRevisionTests(ctx);
  runApprovalPayoutTests(ctx);
  runDisputeSplitTests(ctx);
  runReviewsRatingsTests(ctx);
  runAdminModerationTests(ctx);

  // Register Tier 2: Boundary & Corner Case Suites
  runAuthBoundaryTests(ctx);
  runKycBoundaryTests(ctx);
  runCampaignBoundaryTests(ctx);
  runBiddingBoundaryTests(ctx);
  runEscrowBoundaryTests(ctx);
  runDeliverableBoundaryTests(ctx);
  runApprovalBoundaryTests(ctx);
  runDisputeBoundaryTests(ctx);
  runReviewsBoundaryTests(ctx);
  runAdminBoundaryTests(ctx);

  // Register Tier 3: Pairwise Combinatorial Matrix
  runPairwiseMatrixTests(ctx);

  // Register Tier 4: Real-World Multi-Actor Scenarios
  runHappyPathLifecycleTests(ctx);
  runRevisionApprovalLifecycleTests(ctx);
  runDisputeCreatorWinLifecycleTests(ctx);
  runDisputeBusinessRefundLifecycleTests(ctx);
  runDisputeSplitSettlementLifecycleTests(ctx);
  runCancellationLifecycleTests(ctx);
  runMultiPartyConcurrentLifecycleTests(ctx);

  // Execute All Test Suites
  const result = await runnerContext.runAll(true);

  console.log('\n\x1b[1m\x1b[35m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[37m                           EXECUTION SUMMARY                          \x1b[0m');
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');
  console.log(`  \x1b[1mTotal Suites:\x1b[0m   ${result.suites.length}`);
  console.log(`  \x1b[1mTotal Tests:\x1b[0m    ${result.totalTests}`);
  console.log(`  \x1b[32m✔ Passed:\x1b[0m       ${result.totalPassed}`);
  console.log(`  \x1b[31m✖ Failed:\x1b[0m       ${result.totalFailed}`);
  console.log(`  \x1b[1mDuration:\x1b[0m       ${result.totalDurationMs}ms`);
  console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');

  if (result.passed) {
    console.log('\x1b[1m\x1b[32m✔ ALL E2E TEST SUITES PASSED CLEANLY (100% SUCCESS RATE)\x1b[0m\n');
    process.exit(0);
  } else {
    console.error('\x1b[1m\x1b[31m✖ SOME E2E TESTS FAILED — CHECK LOGS ABOVE\x1b[0m\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
