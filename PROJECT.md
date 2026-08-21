# Project: Creator-Business Collaboration Platform

## Architecture
Monorepo architecture with Yarn/NPM workspaces:
- `packages/shared`: Shared TypeScript types, collaboration state machine definitions, DTOs, API contracts, constants, and utilities.
- `packages/prisma`: Prisma ORM schema (`@cbp/prisma`), client generator, PostgreSQL migrations, and database seed scripts.
- `apps/backend`: NestJS 10 REST API and Socket.io WebSocket Gateway, Prisma client integration, JWT + RBAC guards, Razorpay Marketplace / Escrow payments, KYC pipelines (PAN/GST/Aadhaar validation), Social stats aggregators (Instagram & YouTube API / scraping fallback), notification service.
- `apps/admin`: Next.js 14 App Router administration portal, shadcn/ui + Tailwind CSS, TanStack Query v5, Recharts analytics, KYC document review, campaign moderation, dispute resolution & manual split release, transaction auditing.
- `apps/creator-app`: Flutter mobile app for content creators (Onboarding/KYC, Social stats, Portfolio, Campaign discovery & bidding, In-app chat, Deliverable submission, Collaboration tracking, Earnings/wallet, Business reviews).
- `apps/business-app`: Flutter mobile app for businesses/brands (Onboarding/GST verification, Campaign creation & budget/milestone definition, Creator discovery, Bid review & negotiation, Razorpay escrow funding, Deliverable review/revision/approval, Dispute management, Creator ratings).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Monorepo & Packaging Foundation | Fix workspace naming (@cbp/prisma, @cbp/shared, apps/admin), shared types, Prisma schema syntax error, and migration/seed setup | M1: Foundation & Shared Core | Survey & R1 |
| F02 | Database Schema, Migrations & Seeds | Complete PostgreSQL schema for 16 models, Prisma migrations, robust test fixture seeds | M1: Foundation & Shared Core | Survey & R1 |
| F03 | Auth & RBAC Security | JWT auth, refresh tokens, strict role-based access control (Admin, Business, Creator) fixing hierarchy bug | M2: Backend Core Services | Survey & R1 |
| F04 | Creator & Business Profiles & KYC | Profile management, document uploads, KYC verification pipeline (PAN/GST/Identity) | M2: Backend Core Services | Survey & R1 |
| F05 | Campaign & Bid Workflow Engine | Campaign creation, filtering, bidding, counter-offers, negotiation state transitions | M2: Backend Core Services | Survey & R1 |
| F06 | Collaboration State Machine & Deliverables | Full state machine execution: Agreement -> Escrow -> Submission -> Revision -> Approval -> Payout | M2: Backend Core Services | Survey & R1 |
| F07 | Payment Escrow, Razorpay & Settlements | Escrow funding, webhook handling, platform fee calculation (10%), payout releases, refund splits | M2: Backend Core Services | Survey & R1 |
| F08 | Dispute Resolution System | Dispute filing, evidence attachments, admin adjudication, split refund/release state transitions | M2: Backend Core Services | Survey & R1 |
| F09 | Real-Time Chat & Notifications | WebSocket Socket.io gateway for in-app messaging, automated notification engine (in-app, push, email/SMS) | M2: Backend Core Services | Survey & R1 |
| F10 | Social Stats Aggregator & Reviews | Instagram & YouTube stats aggregation, mutual review & 5-star rating system | M2: Backend Core Services | Survey & R1 |
| F11 | Admin Portal Foundation & Layout | Next.js 14 App Router, Tailwind, shadcn/ui components, Auth/session management, responsive sidebar/header | M3: Next.js Admin Portal | Survey & R2 |
| F12 | Admin KYC Verification Queue | Document previewer, PAN/GST verification, approve/reject/request-info workflows | M3: Next.js Admin Portal | Survey & R2 |
| F13 | Admin Dispute Adjudication & Payouts | Dispute case dossier, chat audit logs, split refund calculator, manual escrow release/refund | M3: Next.js Admin Portal | Survey & R2 |
| F14 | Admin Campaign Moderation & Analytics | Campaign moderation, featured toggle, user management (ban/suspend), Recharts KPI dashboards | M3: Next.js Admin Portal | Survey & R2 |
| F15 | Flutter Shared Architecture & Dependencies | Fix Flutter dependency conflicts (cached_network_image vs firebase_messaging), ApiClient, Riverpod state, shared models | M4: Flutter Mobile Platform Core | Survey & R3/R4 |
| F16 | Flutter Creator App | Complete Creator mobile app screens (Auth/KYC, Discovery, Bidding, Work/Milestones, Chat, Wallet, Reviews) | M5: Flutter Creator App | Survey & R3 |
| F17 | Flutter Business App | Complete Business mobile app screens (Auth/GST, Campaign Creator, Creator Discovery, Bid Negotiation, Escrow Pay, Review/Approval, Disputes) | M6: Flutter Business App | Survey & R4 |
| F18 | Automated Testing & E2E Acceptance | Passing type-check, builds, flutter analyze, unit & integration tests, full E2E test suite validation | M7: E2E Verification & Hardening | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation & Shared Core | `@cbp/shared`, `@cbp/prisma` name fix, Prisma schema correction, migrations, seed script, shared state machine | none | DONE |
| M2 | Backend Core Services | `@cbp/backend` all 14 NestJS modules, RBAC fix, Auth, Campaigns, Bids, Collaborations, Payments/Escrow, Chat, KYC, Notifications, Reviews, Disputes, Admin/Health, Unit/Integration tests | M1 | DONE |
| M3 | Next.js Admin Portal | `apps/admin` complete App router implementation, KYC review queue, Dispute resolution & split calculator, Campaign moderation, User management, Analytics dashboards | M1, M2 | DONE |
| M4 | Flutter Mobile Platform Core | Fix Flutter dependencies, shared Dart models, ApiClient, WebSocket client, Secure storage, core UI widgets | M1 | DONE |
| M5 | Flutter Creator App | `apps/creator-app` all 11 feature screens, Riverpod state notifiers, onboarding/KYC, discover, bid, deliverable submission, chat, wallet, reviews | M4, M2 | DONE |
| M6 | Flutter Business App | `apps/business-app` full scaffolding, 10 feature screens, campaign creation, creator discovery, bid review, escrow pay, deliverable review, disputes, ratings | M4, M2 | DONE |
| M7 | E2E Verification & Hardening | Full multi-tier E2E testing suite, `npm run type-check`, `npm run build`, `flutter analyze`, migrations & seeds execution, forensic audit | M1, M2, M3, M4, M5, M6 | DONE |

## Code Layout
```
creator-biz-platform/
├── package.json
├── tsconfig.base.json
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types/
│   │       ├── state-machine/
│   │       └── constants/
│   └── prisma/
│       ├── package.json
│       ├── tsconfig.json
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── src/
│           └── index.ts
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   └── modules/
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── creators/
│   │   │       ├── businesses/
│   │   │       ├── campaigns/
│   │   │       ├── bids/
│   │   │       ├── collaborations/
│   │   │       ├── payments/
│   │   │       ├── chat/
│   │   │       ├── kyc/
│   │   │       ├── notifications/
│   │   │       ├── reviews/
│   │   │       ├── disputes/
│   │   │       ├── files/
│   │   │       └── admin/
│   │   └── test/
│   ├── admin/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── lib/
│   │       └── types/
│   ├── creator-app/
│   │   ├── pubspec.yaml
│   │   └── lib/
│   │       ├── main.dart
│   │       ├── core/
│   │       └── features/
│   └── business-app/
│       ├── pubspec.yaml
│       └── lib/
│           ├── main.dart
│           ├── core/
│           └── features/
└── tests/
    └── e2e/
```

## Interface Contracts
### `@cbp/shared` ↔ All Workspaces
- `UserRole`: `ADMIN`, `BUSINESS`, `CREATOR`
- `CampaignStatus`: `DRAFT`, `PUBLISHED`, `IN_REVIEW`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`
- `BidStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `COUNTERED`
- `CollaborationStatus`: `AGREED`, `PAYMENT_PENDING`, `IN_PROGRESS`, `SUBMITTED`, `REVISION_REQUESTED`, `APPROVED`, `COMPLETED`, `DISPUTED`, `CANCELLED`
- `DisputeStatus`: `OPEN`, `UNDER_REVIEW`, `RESOLVED_CREATOR`, `RESOLVED_BUSINESS`, `RESOLVED_SPLIT`
- `PaymentStatus`: `PENDING`, `ESCROW_HELD`, `RELEASED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `FAILED`

### Backend REST API & WebSocket Gateway ↔ Admin / Mobile Apps
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`
- Campaigns: `GET /api/campaigns`, `POST /api/campaigns`, `GET /api/campaigns/:id`, `PATCH /api/campaigns/:id`, `DELETE /api/campaigns/:id`
- Bids: `GET /api/campaigns/:id/bids`, `POST /api/campaigns/:id/bids`, `PATCH /api/bids/:id`, `POST /api/bids/:id/accept`, `POST /api/bids/:id/counter`
- Collaborations: `GET /api/collaborations/:id`, `POST /api/collaborations/:id/submit`, `POST /api/collaborations/:id/request-revision`, `POST /api/collaborations/:id/approve`
- Payments: `POST /api/payments/escrow/create-order`, `POST /api/payments/escrow/verify`, `POST /api/payments/webhook`, `GET /api/payments/history`
- Disputes: `POST /api/disputes`, `GET /api/disputes/:id`, `POST /api/disputes/:id/resolve`
- Chat: `GET /api/chat/conversations`, `GET /api/chat/conversations/:id/messages`, WebSocket event `sendMessage`, `newMessage`, `messageRead`
- KYC: `POST /api/kyc/submit`, `GET /api/kyc/status`, `GET /api/admin/kyc/pending`, `POST /api/admin/kyc/:id/review`
