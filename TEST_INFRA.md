# E2E Test Infra: Creator-Business Collaboration Platform

## Test Philosophy
- Opaque-box, requirement-driven. Derives strictly from `ORIGINAL_REQUEST.md`.
- Methodology: Category-Partition + BVA + Pairwise + Real-World Workload Testing.

## Feature Inventory & Test Coverage Goals
| # | Feature | Requirement Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|--------------------|:-----------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | Auth & RBAC (Admin, Business, Creator) | ORIGINAL_REQUEST §R1 | 5 tests | 5 tests | ✓ | ✓ |
| 2 | Creator & Business KYC Onboarding | ORIGINAL_REQUEST §R1, R3, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 3 | Campaign Creation & Search Filtering | ORIGINAL_REQUEST §R1, R3, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 4 | Bidding, Counter-Offer & Negotiation | ORIGINAL_REQUEST §R1, R3, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 5 | Escrow Funding & Razorpay Integration | ORIGINAL_REQUEST §R1, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 6 | Deliverable Submission & Revision Cycle | ORIGINAL_REQUEST §R1, R3, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 7 | Approval, Platform Fee & Payout Settlement | ORIGINAL_REQUEST §R1, R3 | 5 tests | 5 tests | ✓ | ✓ |
| 8 | Dispute Raising, Moderation & Split Release | ORIGINAL_REQUEST §R1, R2, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 9 | Mutual Ratings & Reviews | ORIGINAL_REQUEST §R1, R3, R4 | 5 tests | 5 tests | ✓ | ✓ |
| 10 | Admin Portal Moderation & Analytics | ORIGINAL_REQUEST §R2 | 5 tests | 5 tests | ✓ | ✓ |

## Test Architecture
- Test Runner: Jest / TypeScript automated test harness (`tests/e2e/runner.ts` / `npm run test:e2e`).
- Multi-tier validation:
  - Tier 1: Isolated feature functional verification.
  - Tier 2: Boundary value analysis & negative security tests (invalid roles, negative escrow, invalid PAN/GST, illegal state transitions).
  - Tier 3: Pairwise state machine interaction tests (e.g., Counter-bid after dispute, Cancel during escrow, Re-submit after revision).
  - Tier 4: Complete end-to-end multi-actor lifecycles simulating Creator, Business, and Admin concurrently.
- Pass/Fail Semantics: 100% exit code 0, 0 unhandled rejections, strict state machine assertions.
