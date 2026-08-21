# Creator–Business Collaboration Platform
## Database Schema & Entity Relationships

> **ORM:** Prisma with PostgreSQL 16
> Generated as production-ready Prisma schema with indexes, relations, and enums.

---

## Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum UserRole {
  CREATOR
  BUSINESS
  ADMIN
  SUPER_ADMIN
}

enum VerificationStatus {
  PENDING
  UNDER_REVIEW
  VERIFIED
  REJECTED
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
  COMPLETED
  CANCELLED
}

enum CollaborationStatus {
  PENDING          // Business invited creator / creator applied
  NEGOTIATING      // Price/deliverables being negotiated
  ACCEPTED         // Creator accepted, awaiting payment
  IN_PROGRESS      // Payment locked, creator working
  DELIVERABLE_SUBMITTED  // Creator submitted work
  REVISION_REQUESTED    // Business requested changes
  APPROVED         // Business approved deliverables
  PENDING_PAYOUT   // Approved, awaiting payout release
  PAID_OUT         // Creator paid
  DISPUTED         // Either party raised a dispute
  CANCELLED        // Collaboration cancelled
  REFUNDED         // Funds returned to business
}

enum PaymentStatus {
  PENDING
  LOCKED          // Held in escrow
  RELEASED        // Released to creator
  REFUNDED        // Returned to business
  PARTIALLY_REFUNDED
  DISPUTED
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_BUSINESS  // Refund issued to business
  RESOLVED_CREATOR   // Payout released to creator
  RESOLVED_PARTIAL   // Partial settlement
  ESCALATED
}

enum ReviewType {
  BUSINESS_TO_CREATOR
  CREATOR_TO_BUSINESS
}

enum DeliverableType {
  INSTAGRAM_REEL
  INSTAGRAM_STORY
  YOUTUBE_VIDEO
  YOUTUBE_SHORT
  SOCIAL_POST
  EVENT_APPEARANCE
  OTHER
}

enum ChatMessageStatus {
  SENT
  DELIVERED
  READ
}

enum PlatformPromotionType {
  FEATURED_CREATOR
  FEATURED_BUSINESS
  FEATURED_CAMPAIGN
  PRIORITY_LEAD
}

// ============================================================
// USERS (Base table for all user types)
// ============================================================

model User {
  id                  String            @id @default(uuid())
  email               String?           @unique
  phone               String?           @unique
  firebaseUid         String?           @unique
  role                UserRole
  verificationStatus  VerificationStatus @default(PENDING)
  verificationNote    String?           // Admin rejection reason
  isActive            Boolean           @default(true)
  isBanned            Boolean           @default(false)
  banReason           String?
  lastLoginAt         DateTime?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  // Relations
  creatorProfile      CreatorProfile?
  businessProfile     BusinessProfile?
  adminProfile        AdminProfile?
  chatParticipations  ChatParticipant[]
  sentMessages        Message[]         @relation("SenderMessages")
  reviewsReceived     Review[]          @relation("ReviewsReceived")
  reviewsGiven        Review[]          @relation("ReviewsGiven")
  collaborations      Collaboration[]
  auditLogs           AuditLog[]

  // Composite index for role + verification lookups
  @@index([role, verificationStatus])
  @@index([isActive, createdAt])
}

// ============================================================
// CREATOR PROFILE
// ============================================================

model CreatorProfile {
  id                    String    @id @default(uuid())
  userId                String    @unique
  displayName           String
  bio                   String?
  profileImageUrl       String?
  category              String    // e.g., "Fitness", "Food", "Fashion"
  subCategories         String[]  // Multiple tags
  location              String?   // City, State
  languages             String[]  @default:["English", "Hindi"]
  // Private pricing (never publicly visible)
  rateCardJson          Json?     // { [deliverableType]: minRate, maxRate }
  // Verified social stats (populated by background worker)
  socialStatsJson       Json?     // { platform: { followers, engagement, ... } }
  lastSocialStatsRefresh DateTime?
  // KYC
  panNumber             String?   @db.VarChar(10)
  aadhaarNumber         String?   @db.VarChar(12)
  bankAccountNumber     String?
  bankIfsc              String?
  payoutMethod          String?   // "UPI", "IMPS", "NEFT"
  kycDocumentUrl        String?   // Uploaded KYC document
  kycStatus             VerificationStatus @default(PENDING)
  kycNote               String?
  // Feature flags
  isFeatured            Boolean   @default(false)
  featuredUntil         DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  // Relations
  user                  User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaignsApplied      Collaboration[]
  portfolioItems        PortfolioItem[]
  reviewsReceived       Review[]       @relation("CreatorReviews")
  promotions            PlatformPromotion[]

  @@index([category, location])
  @@index([isFeatured, createdAt])
}

// ============================================================
// PORTFOLIO ITEM
// ============================================================

model PortfolioItem {
  id              String           @id @default(uuid())
  creatorProfileId String
  title           String
  description     String?
  mediaUrls       String[]         // S3 URLs
  thumbnailUrl    String?
  deliverableType DeliverableType?
  campaignId      String?          // If linked to a past collaboration
  sortOrder       Int              @default(0)
  createdAt       DateTime         @default(now())

  // Relations
  creatorProfile  CreatorProfile   @relation(fields: [creatorProfileId], references: [id], onDelete: Cascade)

  @@index([creatorProfileId])
}

// ============================================================
// BUSINESS PROFILE
// ============================================================

model BusinessProfile {
  id                  String            @id @default(uuid())
  userId              String            @unique
  businessName        String
  businessType        String            // e.g., "Restaurant", "D2C Brand", "Event Organizer"
  industry            String?
  description         String?
  website             String?
  logoUrl             String?
  // Address
  addressLine1        String?
  addressLine2        String?
  city                String?
  state               String?
  pincode             String?
  // Owner details
  ownerName           String?
  ownerEmail          String?
  ownerPhone          String?
  // KYC
  gstNumber           String?           @db.VarChar(15)
  businessLicenseUrl  String?
  addressProofUrl     String?
  gstCertificateUrl   String?
  // Verification
  kycStatus           VerificationStatus @default(PENDING)
  kycNote             String?
  verifiedAt          DateTime?
  // Feature flags
  isFeatured          Boolean           @default(false)
  featuredUntil       DateTime?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  // Relations
  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaigns           Campaign[]
  reviewsReceived     Review[]          @relation("BusinessReviews")
  promotions          PlatformPromotion[]

  @@index([businessType, city])
  @@index([isFeatured, createdAt])
}

// ============================================================
// ADMIN PROFILE
// ============================================================

model AdminProfile {
  id        String   @id @default(uuid())
  userId    String   @unique
  role      UserRole // ADMIN or SUPER_ADMIN
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ============================================================
// CAMPAIGNS
// ============================================================

model Campaign {
  id                  String          @id @default(uuid())
  businessId          String
  title               String
  description         String
  // Requirements
  deliverableTypes    DeliverableType[]
  creatorCount        Int             // Number of creators needed
  locationType        String          @default("REMOTE") // "REMOTE" | "ON_SITE" | "HYBRID"
  locationCity        String?
  locationState       String?
  // Budget
  budgetType          String          @default("FIXED") // "FIXED" | "RANGE"
  budgetMin           Decimal?        @db.Decimal(12, 2)
  budgetMax           Decimal?        @db.Decimal(12, 2)
  // Platform fee is calculated on final agreed amount
  platformFeePercent  Decimal         @default(10.00) @db.Decimal(5, 2)
  // Status
  status              CampaignStatus  @default(DRAFT)
  isUrgent            Boolean         @default(false)
  isFeatured          Boolean         @default(false)
  // Auto-approval
  autoApproveAfterDays Int?           // If business doesn't respond, auto-approve after N days
  // Timestamps
  publishedAt         DateTime?
  closedAt            DateTime?
  deadlineAt          DateTime?
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  // Relations
  business            BusinessProfile @relation(fields: [businessId], references: [id], onDelete: Cascade)
  collaborations      Collaboration[]
  disputes            Dispute[]
  platformPromotions  PlatformPromotion[]

  @@index([businessId, status, createdAt])
  @@index([status, isFeatured, publishedAt])
  @@index([locationCity, locationState])
  @@index([deadlineAt])
}

// ============================================================
// COLLABORATIONS (Creator <-> Campaign link)
// ============================================================

model Collaboration {
  id              String              @id @default(uuid())
  campaignId      String
  creatorId       String
  // Offer / Bid details
  offeredAmount   Decimal             @db.Decimal(12, 2)
  negotiatedAmount Decimal?           @db.Decimal(12, 2) // Final agreed price
  // Status
  status          CollaborationStatus @default(PENDING)
  // Message history (brief negotiation summary)
  negotiationNotes String?           @db.Text
  // Deliverables
  revisionCount   Int                 @default(0)
  maxRevisions    Int                 @default(2)
  deliverableLinks Json?              // [{ type, url, submittedAt, revisionOf }]
  approvalNotes   String?
  // Timestamps
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  acceptedAt      DateTime?
  inProgressAt    DateTime?
  submittedAt     DateTime?
  approvedAt      DateTime?
  paidOutAt       DateTime?
  // Auto-approval
  autoApproveAt   DateTime?

  // Relations
  campaign        Campaign       @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  creator         CreatorProfile @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  payments        Payment[]
  disputes        Dispute[]
  chatThread      ChatThread?
  reviews         Review[]

  @@unique([campaignId, creatorId])
  @@index([creatorId, status])
  @@index([campaignId, status])
  @@index([status, createdAt])
}

// ============================================================
// PAYMENTS & ESCROW
// ============================================================

model Payment {
  id                String          @id @default(uuid())
  collaborationId   String
  // Amounts (all in INR paise)
  totalAmount       Decimal         @db.Decimal(12, 2)
  platformFee       Decimal         @db.Decimal(12, 2)
  creatorPayout     Decimal         @db.Decimal(12, 2)
  // Payment provider details
  provider          String          @default("RAZORPAY") // "RAZORPAY" | "CASHFREE"
  providerPaymentId String?        // Razorpay order / payment ID
  providerPayoutId  String?        // Razorpay payout ID
  // Status
  status            PaymentStatus   @default(PENDING)
  // Timestamps
  lockedAt          DateTime?
  releasedAt        DateTime?
  refundedAt        DateTime?
  failedAt          DateTime?
  failureReason     String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  collaboration     Collaboration   @relation(fields: [collaborationId], references: [id], onDelete: Cascade)
  escrowTransactions EscrowTransaction[]

  @@index([collaborationId])
  @@index([status, createdAt])
}

model EscrowTransaction {
  id          String        @id @default(uuid())
  paymentId   String
  type        String        // "LOCK" | "RELEASE" | "REFUND" | "PARTIAL_REFUND" | "PLATFORM_FEE"
  amount      Decimal       @db.Decimal(12, 2)
  providerRef String?       // Provider transaction reference
  metadata    Json?
  createdAt   DateTime      @default(now())

  // Relations
  payment     Payment       @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@index([paymentId])
}

// ============================================================
// DISPUTES
// ============================================================

model Dispute {
  id              String        @id @default(uuid())
  campaignId      String
  collaborationId String
  raisedBy        String        // User ID
  againstUserId   String?       // The other party
  reason          String
  category        String        // "DELIVERABLE_QUALITY" | "PAYMENT" | "CANCELLATION" | "OTHER"
  // Resolution
  status          DisputeStatus @default(OPEN)
  resolutionNotes String?
  resolvedBy      String?       // Admin user ID
  // Financial outcome
  refundAmount    Decimal?       @db.Decimal(12, 2)
  payoutAmount    Decimal?       @db.Decimal(12, 2)
  // Timestamps
  createdAt       DateTime       @default(now())
  resolvedAt      DateTime?
  updatedAt       DateTime       @updatedAt

  // Relations
  campaign        Campaign      @relation(fields: [campaignId], references: [id])
  collaboration   Collaboration @relation(fields: [collaborationId], references: [id])

  @@index([collaborationId, status])
  @@index([status, createdAt])
}

// ============================================================
// CHAT
// ============================================================

model ChatThread {
  id             String   @id @default(uuid())
  collaborationId String  @unique
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  collaboration  Collaboration @relation(fields: [collaborationId], references: [id], onDelete: Cascade)
  participants   ChatParticipant[]
  messages       Message[]

  @@index([collaborationId])
}

model ChatParticipant {
  id          String    @id @default(uuid())
  threadId    String
  userId      String
  joinedAt    DateTime  @default(now())
  lastReadAt  DateTime?

  // Relations
  thread      ChatThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@unique([threadId, userId])
  @@index([userId])
}

model Message {
  id           String            @id @default(uuid())
  threadId     String
  senderId     String
  content      String            @db.Text
  messageType  String            @default("TEXT") // "TEXT" | "IMAGE" | "FILE"
  attachmentUrl String?
  status       ChatMessageStatus @default(SENT)
  isEdited     Boolean           @default(false)
  // Contact sharing guard
  containsContactInfo Boolean      @default(false)
  flaggedBySystem    Boolean       @default(false)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  // Relations
  thread       ChatThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender       User       @relation("SenderMessages", fields: [senderId], references: [id], onDelete: Cascade)

  @@index([threadId, createdAt])
  @@index([senderId])
}

// ============================================================
// REVIEWS
// ============================================================

model Review {
  id              String      @id @default(uuid())
  collaborationId String
  reviewerId      String      // User ID of the reviewer
  revieweeId      String      // User ID being reviewed
  reviewType      ReviewType  // BUSINESS_TO_CREATOR or CREATOR_TO_BUSINESS
  overallRating   Int         // 1-5
  criteriaRatings Json?       // { "communication": 4, "quality": 5, "timeliness": 3 }
  comment         String?
  isVisible       Boolean     @default(true)
  createdAt       DateTime    @default(now())

  // Relations
  collaboration   Collaboration @relation(fields: [collaborationId], references: [id], onDelete: Cascade)
  reviewer        User          @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewee        User          @relation("ReviewsReceived", fields: [revieweeId], references: [id])

  @@unique([collaborationId, reviewerId])
  @@index([revieweeId, isVisible])
  @@index([overallRating])
}

// ============================================================
// PLATFORM PROMOTIONS
// ============================================================

model PlatformPromotion {
  id          String              @id @default(uuid())
  type        PlatformPromotionType
  // Polymorphic target
  creatorId   String?
  businessId  String?
  campaignId  String?
  startsAt    DateTime
  endsAt      DateTime
  isActive    Boolean             @default(true)
  createdAt   DateTime            @default(now())

  // Relations
  creator     CreatorProfile?     @relation(fields: [creatorId], references: [id])
  business    BusinessProfile?    @relation(fields: [businessId], references: [id])
  campaign    Campaign?           @relation(fields: [campaignId], references: [id])

  @@index([type, isActive, startsAt, endsAt])
}

// ============================================================
// AUDIT LOG
// ============================================================

model AuditLog {
  id          String   @id @default(uuid())
  actorUserId String?
  action      String
  entityType  String
  entityId    String
  changes     Json?    // { before, after }
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([actorUserId, createdAt])
}

// ============================================================
// SYSTEM SETTINGS (key-value config)
// ============================================================

model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  updatedBy   String?
  updatedAt   DateTime @updatedAt
}
```

---

## Entity Relationship Summary

```
Users (1) ────── (0..1) CreatorProfile
    │
    ├── (0..1) BusinessProfile
    ├── (0..1) AdminProfile
    ├── (1..*) ChatParticipant
    ├── (1..*) Message (as sender)
    ├── (1..*) Review (as reviewer)
    ├── (1..*) Review (as reviewee)
    ├── (1..*) Collaboration (as creator)
    └── (1..*) AuditLog

CreatorProfile (1) ──── (*) PortfolioItem
CreatorProfile (1) ──── (*) Collaboration
CreatorProfile (1) ──── (*) Review (as reviewee)
CreatorProfile (1) ──── (*) PlatformPromotion

BusinessProfile (1) ──── (*) Campaign
BusinessProfile (1) ──── (*) Review (as reviewee)
BusinessProfile (1) ──── (*) PlatformPromotion

Campaign (1) ──── (*) Collaboration
Campaign (1) ──── (*) Dispute
Campaign (1) ──── (0..*) PlatformPromotion

Collaboration (1) ──── (1) ChatThread
Collaboration (1) ──── (0..1) Payment
Collaboration (1) ──── (0..*) Dispute
Collaboration (1) ──── (*) Review

Payment (1) ──── (*) EscrowTransaction

ChatThread (1) ──── (*) ChatParticipant
ChatThread (1) ──── (*) Message
```

---

## Critical Indexes Explained

| Table | Index | Purpose |
|---|---|---|
| `Users` | `(role, verificationStatus)` | Filter unverified creators/businesses for admin queues |
| `CreatorProfile` | `(category, location)` | Creator discovery search with filters |
| `CreatorProfile` | `(isFeatured, createdAt)` | Fetch featured creators for home screen |
| `Campaign` | `(status, isFeatured, publishedAt)` | Campaign discovery feed ordering |
| `Campaign` | `(locationCity, locationState)` | Location-based campaign filtering |
| `Campaign` | `(deadlineAt)` | Find expiring campaigns for notifications |
| `Collaboration` | `(creatorId, status)` | Creator's active collaborations dashboard |
| `Collaboration` | `(campaignId, status)` | Business's campaign applicant list |
| `Payment` | `(status, createdAt)` | Finance team: pending escrow lookups |
| `Message` | `(threadId, createdAt)` | Paginated chat history per thread |
| `Dispute` | `(status, createdAt)` | Admin dispute resolution queue |

---

## Migration Strategy (Prisma)

```bash
# Initial migration
npx prisma migrate dev --name init_schema

# Production deployment
npx prisma migrate deploy

# Seed data for development
npx prisma db seed
```

### Seed Example (dev)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create a super admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      role: 'SUPER_ADMIN',
      verificationStatus: 'VERIFIED',
      adminProfile: {
        create: { role: 'SUPER_ADMIN' }
      }
    }
  })

  // Create a sample business
  const businessUser = await prisma.user.create({
    data: {
      email: 'business@demo.com',
      phone: '+919876543210',
      role: 'BUSINESS',
      verificationStatus: 'VERIFIED',
      businessProfile: {
        create: {
          businessName: 'Demo Restaurants Pvt Ltd',
          businessType: 'Restaurant Chain',
          city: 'Mumbai',
          state: 'Maharashtra',
          ownerName: 'Rajesh Kumar',
          kycStatus: 'VERIFIED'
        }
      }
    }
  })

  console.log('Seed complete:', { admin, businessUser })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```
