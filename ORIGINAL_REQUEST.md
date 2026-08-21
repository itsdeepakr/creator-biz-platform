# Original User Request

## Initial Request — 2026-08-21T12:16:00Z

Build and fully complete the end-to-end Creator-Business Collaboration Platform connecting content creators/influencers with businesses in India, covering the NestJS backend API with Prisma/PostgreSQL, Next.js 14 Admin Portal, Flutter Creator App, and Flutter Business App based on the product specification and collaboration state machine.

Working directory: `/Users/FOUDER/creator-biz-platform`
Integrity mode: development

## Requirements

### R1. Backend Architecture & Core Services (`apps/backend`, `packages/prisma`, `packages/shared`)
Complete all NestJS modules, database migrations, Prisma schema models, authentication/RBAC (Admin, Business, Creator), real-time WebSocket chat gateway, campaign workflow state machine, Razorpay Route / Marketplace payment escrow & settlement with platform fee deduction, KYC verification pipelines (PAN/GST/Identity), social stats aggregator (Instagram & YouTube follower/engagement metrics), and automated notification engine.

### R2. Next.js Admin Portal (`apps/admin`)
Implement full administrative workflows including creator & business KYC document verification, campaign moderation, dispute resolution & manual refund/release controls, user management, transaction/payout auditing, and platform analytics dashboards.

### R3. Flutter Creator Mobile App (`apps/creator-app`)
Implement creator onboarding and KYC submission, social account connection (Instagram & YouTube stats display), portfolio management, campaign discovery & filtering, bidding & price negotiation, in-app messaging, deliverable submission/proof upload, milestone & collaboration tracking, private earnings/wallet view, and business review & ratings.

### R4. Flutter Business Mobile App (`apps/business-app`)
Implement business onboarding and verification (GST & registration docs), campaign creation with budget & deliverable definitions, creator search & discovery with filterable metrics, bid review & negotiation, contract escrow funding via Razorpay, deliverable review/revision requests/approval, dispute management, and creator review & ratings.

## Acceptance Criteria

### Build & Type Safety
- [ ] `npm run type-check` passes with zero TypeScript errors across all workspaces (`@cbp/backend`, `@cbp/admin`, `@cbp/shared`, `@cbp/prisma`).
- [ ] `npm run build` succeeds cleanly for backend and admin portal.
- [ ] Flutter apps (`creator-app` and `business-app`) analyze cleanly with `flutter analyze` and build without errors.

### Core Workflow & State Machine
- [ ] Complete collaboration lifecycle executes end-to-end: Campaign Creation → Creator Bid → Negotiation → Agreement & Escrow Payment → Execution → Deliverable Submission → Review/Revision → Approval & Payout Settlement → Mutual Ratings.
- [ ] Dispute handling and refund workflows operate as specified in the collaboration state machine.

### Verification & Automated Testing
- [ ] Database migrations execute cleanly (`npm run db:migrate`) and seed initial test fixtures (`npm run db:seed`).
- [ ] Unit and integration test suites cover auth, campaign bidding, payments/escrow state transitions, and dispute resolution.
