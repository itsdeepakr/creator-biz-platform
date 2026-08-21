# Creator–Business Collaboration Platform
## REST API Specifications (OpenAPI 3.0)

> **Base URL:** `https://api.platform.com/v1`
> **Authentication:** Bearer JWT (obtained via Firebase Auth token exchange)
> **Content-Type:** `application/json`

---

## OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: Creator-Biz Collaboration Platform API
  description: Core REST API for the Creator-Business Collaboration Platform
  version: 1.0.0
  contact:
    name: Platform Engineering

servers:
  - url: https://api.platform.com/v1
    description: Production

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    # --- Enums ---
    UserRole:
      type: string
      enum: [CREATOR, BUSINESS, ADMIN, SUPER_ADMIN]

    VerificationStatus:
      type: string
      enum: [PENDING, UNDER_REVIEW, VERIFIED, REJECTED]

    CampaignStatus:
      type: string
      enum: [DRAFT, ACTIVE, PAUSED, CLOSED, COMPLETED, CANCELLED]

    CollaborationStatus:
      type: string
      enum: [PENDING, NEGOTIATING, ACCEPTED, IN_PROGRESS, DELIVERABLE_SUBMITTED, REVISION_REQUESTED, APPROVED, PENDING_PAYOUT, PAID_OUT, DISPUTED, CANCELLED, REFUNDED]

    PaymentStatus:
      type: string
      enum: [PENDING, LOCKED, RELEASED, REFUNDED, PARTIALLY_REFUNDED, DISPUTED]

    DisputeStatus:
      type: string
      enum: [OPEN, UNDER_REVIEW, RESOLVED_BUSINESS, RESOLVED_CREATOR, RESOLVED_PARTIAL, ESCALATED]

    DeliverableType:
      type: string
      enum: [INSTAGRAM_REEL, INSTAGRAM_STORY, YOUTUBE_VIDEO, YOUTUBE_SHORT, SOCIAL_POST, EVENT_APPEARANCE, OTHER]

    ReviewType:
      type: string
      enum: [BUSINESS_TO_CREATOR, CREATOR_TO_BUSINESS]

    ErrorResponse:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object

    PaginatedResponse:
      type: object
      properties:
        data:
          type: array
        meta:
          type: object
          properties:
            total:
              type: integer
            page:
              type: integer
            limit:
              type: integer
            totalPages:
              type: integer

    # --- Core Models ---
    User:
      type: object
      required: [id, role, verificationStatus]
      properties:
        id:
          type: string
        email:
          type: string
          nullable: true
        phone:
          type: string
          nullable: true
        role:
          $ref: '#/components/schemas/UserRole'
        verificationStatus:
          $ref: '#/components/schemas/VerificationStatus'
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time

    CreatorProfile:
      type: object
      required: [id, userId, displayName, category, verificationStatus]
      properties:
        id:
          type: string
        userId:
          type: string
        displayName:
          type: string
        bio:
          type: string
          nullable: true
        profileImageUrl:
          type: string
          nullable: true
        category:
          type: string
        subCategories:
          type: array
          items:
            type: string
        location:
          type: string
          nullable: true
        languages:
          type: array
          items:
            type: string
        rateCardJson:
          type: object
          nullable: true
          description: Private pricing - only returned to requesting business post-selection
        socialStatsJson:
          type: object
          nullable: true
          description: Verified follower/engagement stats
        lastSocialStatsRefresh:
          type: string
          format: date-time
          nullable: true
        kycStatus:
          $ref: '#/components/schemas/VerificationStatus'
        isFeatured:
          type: boolean
        createdAt:
          type: string
          format: date-time

    BusinessProfile:
      type: object
      required: [id, userId, businessName, verificationStatus]
      properties:
        id:
          type: string
        userId:
          type: string
        businessName:
          type: string
        businessType:
          type: string
        industry:
          type: string
          nullable: true
        description:
          type: string
          nullable: true
        website:
          type: string
          nullable: true
        logoUrl:
          type: string
          nullable: true
        city:
          type: string
          nullable: true
        state:
          type: string
          nullable: true
        ownerName:
          type: string
          nullable: true
        kycStatus:
          $ref: '#/components/schemas/VerificationStatus'
        verifiedAt:
          type: string
          format: date-time
          nullable: true
        isFeatured:
          type: boolean
        createdAt:
          type: string
          format: date-time

    Campaign:
      type: object
      required: [id, businessId, title, status, budgetType]
      properties:
        id:
          type: string
        businessId:
          type: string
        businessName:
          type: string
        title:
          type: string
        description:
          type: string
        deliverableTypes:
          type: array
          items:
            $ref: '#/components/schemas/DeliverableType'
        creatorCount:
          type: integer
        locationType:
          type: string
        locationCity:
          type: string
          nullable: true
        locationState:
          type: string
          nullable: true
        budgetType:
          type: string
          enum: [FIXED, RANGE]
        budgetMin:
          type: number
          nullable: true
        budgetMax:
          type: number
          nullable: true
        status:
          $ref: '#/components/schemas/CampaignStatus'
        isUrgent:
          type: boolean
        isFeatured:
          type: boolean
        deadlineAt:
          type: string
          format: date-time
          nullable: true
        publishedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time

    Collaboration:
      type: object
      required: [id, campaignId, creatorId, status, offeredAmount]
      properties:
        id:
          type: string
        campaignId:
          type: string
        campaignTitle:
          type: string
        creatorId:
          type: string
        creatorName:
          type: string
        businessId:
          type: string
        offeredAmount:
          type: number
        negotiatedAmount:
          type: number
          nullable: true
        status:
          $ref: '#/components/schemas/CollaborationStatus'
        revisionCount:
          type: integer
        maxRevisions:
          type: integer
        deliverableLinks:
          type: array
          items:
            type: object
            properties:
              type:
                $ref: '#/components/schemas/DeliverableType'
              url:
                type: string
              submittedAt:
                type: string
                format: date-time
        createdAt:
          type: string
          format: date-time
        acceptedAt:
          type: string
          format: date-time
          nullable: true
        approvedAt:
          type: string
          format: date-time
          nullable: true
        paidOutAt:
          type: string
          format: date-time
          nullable: true

    Payment:
      type: object
      required: [id, collaborationId, status]
      properties:
        id:
          type: string
        collaborationId:
          type: string
        totalAmount:
          type: number
        platformFee:
          type: number
        creatorPayout:
          type: number
        provider:
          type: string
        providerPaymentId:
          type: string
          nullable: true
        status:
          $ref: '#/components/schemas/PaymentStatus'
        lockedAt:
          type: string
          format: date-time
          nullable: true
        releasedAt:
          type: string
          format: date-time
          nullable: true
        createdAt:
          type: string
          format: date-time

    Dispute:
      type: object
      required: [id, collaborationId, status]
      properties:
        id:
          type: string
        collaborationId:
          type: string
        raisedBy:
          type: string
        category:
          type: string
        reason:
          type: string
        status:
          $ref: '#/components/schemas/DisputeStatus'
        resolutionNotes:
          type: string
          nullable: true
        refundAmount:
          type: number
          nullable: true
        payoutAmount:
          type: number
          nullable: true
        createdAt:
          type: string
          format: date-time
        resolvedAt:
          type: string
          format: date-time
          nullable: true

    Review:
      type: object
      required: [id, collaborationId, reviewerId, revieweeId, overallRating]
      properties:
        id:
          type: string
        collaborationId:
          type: string
        reviewerId:
          type: string
        reviewerName:
          type: string
        revieweeId:
          type: string
        revieweeName:
          type: string
        reviewType:
          $ref: '#/components/schemas/ReviewType'
        overallRating:
          type: integer
          minimum: 1
          maximum: 5
        criteriaRatings:
          type: object
          nullable: true
        comment:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time

    Message:
      type: object
      required: [id, threadId, senderId, content]
      properties:
        id:
          type: string
        threadId:
          type: string
        senderId:
          type: string
        senderName:
          type: string
        content:
          type: string
        messageType:
          type: string
        attachmentUrl:
          type: string
          nullable: true
        status:
          type: string
        createdAt:
          type: string
          format: date-time

    ChatThread:
      type: object
      required: [id, collaborationId]
      properties:
        id:
          type: string
        collaborationId:
          type: string
        participants:
          type: array
          items:
            type: string
        lastMessage:
          type: object
          nullable: true
        unreadCount:
          type: integer
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

  responses:
    Unauthorized:
      description: Unauthorized - missing or invalid JWT
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    Forbidden:
      description: Forbidden - insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    ValidationError:
      description: Bad request - validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

paths:
  # ============================================================
  # AUTHENTICATION
  # ============================================================
  /auth/exchange:
    post:
      tags: [Auth]
      summary: Exchange Firebase token for platform JWT
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [firebaseToken]
              properties:
                firebaseToken:
                  type: string
                  description: Firebase ID token from client
      responses:
        '200':
          description: JWT tokens returned
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  expiresIn:
                    type: integer
        '400':
          $ref: '#/components/responses/ValidationError'

  # ============================================================
  # CAMPAIGNS
  # ============================================================
  /campaigns:
    get:
      tags: [Campaigns]
      summary: List campaigns (creator discovery)
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [ACTIVE, CLOSED, COMPLETED]
        - name: category
          in: query
          schema:
            type: string
        - name: city
          in: query
          schema:
            type: string
        - name: deliverableType
          in: query
          schema:
            $ref: '#/components/schemas/DeliverableType'
        - name: budgetMin
          in: query
          schema:
            type: number
        - name: budgetMax
          in: query
          schema:
            type: number
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: sort
          in: query
          schema:
            type: string
            default: publishedAt
            enum: [publishedAt, budgetMax, deadlineAt, createdAt]
        - name: order
          in: query
          schema:
            type: string
            default: desc
            enum: [asc, desc]
      responses:
        '200':
          description: Paginated campaign list
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/PaginatedResponse'
                  - type: object
                    properties:
                      data:
                        type: array
                        items:
                          $ref: '#/components/schemas/Campaign'

    post:
      tags: [Campaigns]
      summary: Create a new campaign (Business only)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, description, deliverableTypes, creatorCount, budgetType]
              properties:
                title:
                  type: string
                  maxLength: 200
                description:
                  type: string
                  maxLength: 5000
                deliverableTypes:
                  type: array
                  items:
                    $ref: '#/components/schemas/DeliverableType'
                  minItems: 1
                creatorCount:
                  type: integer
                  minimum: 1
                budgetType:
                  type: string
                  enum: [FIXED, RANGE]
                budgetMin:
                  type: number
                  nullable: true
                budgetMax:
                  type: number
                  nullable: true
                locationType:
                  type: string
                  enum: [REMOTE, ON_SITE, HYBRID]
                  default: REMOTE
                locationCity:
                  type: string
                  nullable: true
                locationState:
                  type: string
                  nullable: true
                deadlineAt:
                  type: string
                  format: date-time
                  nullable: true
                autoApproveAfterDays:
                  type: integer
                  nullable: true
                  default: 5
      responses:
        '201':
          description: Campaign created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'
        '403':
          $ref: '#/components/responses/Forbidden'

  /campaigns/{id}:
    get:
      tags: [Campaigns]
      summary: Get campaign details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Campaign details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'
        '404':
          $ref: '#/components/responses/NotFound'

    patch:
      tags: [Campaigns]
      summary: Update campaign (Business owner only)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                budgetMin:
                  type: number
                  nullable: true
                budgetMax:
                  type: number
                  nullable: true
                status:
                  type: string
                  enum: [ACTIVE, PAUSED, CLOSED, CANCELLED]
      responses:
        '200':
          description: Campaign updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Campaign'
        '403':
          $ref: '#/components/responses/Forbidden'

  /campaigns/{id}/collaborations:
    get:
      tags: [Campaigns]
      summary: List applications/creators for a campaign (Business only)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, NEGOTIATING, ACCEPTED, IN_PROGRESS]
      responses:
        '200':
          description: Collaborations list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Collaboration'
        '403':
          $ref: '#/components/responses/Forbidden'

  # ============================================================
  # COLLABORATIONS
  # ============================================================
  /collaborations:
    get:
      tags: [Collaborations]
      summary: List user's collaborations
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, NEGOTIATING, ACCEPTED, IN_PROGRESS, DELIVERABLE_SUBMITTED, REVISION_REQUESTED, APPROVED, PENDING_PAYOUT, PAID_OUT, DISPUTED, CANCELLED]
        - name: role
          in: query
          schema:
            type: string
            enum: [creator, business]
          description: Filter by user's role in the collaboration
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: User's collaborations
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedResponse'

  /collaborations/{id}:
    get:
      tags: [Collaborations]
      summary: Get collaboration details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Collaboration details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'
        '403':
          $ref: '#/components/responses/Forbidden'

  /collaborations:
    post:
      tags: [Collaborations]
      summary: Creator applies to a campaign (creates bid)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [campaignId, offeredAmount]
              properties:
                campaignId:
                  type: string
                offeredAmount:
                  type: number
                proposalNote:
                  type: string
                  maxLength: 2000
      responses:
        '201':
          description: Collaboration created (PENDING)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'
        '400':
          $ref: '#/components/responses/ValidationError'

  /collaborations/{id}/accept:
    post:
      tags: [Collaborations]
      summary: Creator accepts an offer
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Collaboration accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'
        '403':
          $ref: '#/components/responses/Forbidden'

  /collaborations/{id}/counter-offer:
    post:
      tags: [Collaborations]
      summary: Business sends counter-offer to creator
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [offeredAmount]
              properties:
                offeredAmount:
                  type: number
                negotiationNote:
                  type: string
                  maxLength: 2000
      responses:
        '200':
          description: Counter-offer sent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'

  /collaborations/{id}/lock-payment:
    post:
      tags: [Collaborations]
      summary: Business locks payment in escrow
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Payment locked in escrow
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'
        '400':
          $ref: '#/components/responses/ValidationError'

  /collaborations/{id}/submit-deliverables:
    post:
      tags: [Collaborations]
      summary: Creator submits deliverables
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [deliverables]
              properties:
                deliverables:
                  type: array
                  minItems: 1
                  items:
                    type: object
                    required: [type, url]
                    properties:
                      type:
                        $ref: '#/components/schemas/DeliverableType'
                      url:
                        type: string
                        format: uri
      responses:
        '200':
          description: Deliverables submitted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'

  /collaborations/{id}/approve:
    post:
      tags: [Collaborations]
      summary: Business approves deliverables
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Deliverables approved, payout triggered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'

  /collaborations/{id}/request-revision:
    post:
      tags: [Collaborations]
      summary: Business requests revision
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [revisionNote]
              properties:
                revisionNote:
                  type: string
                  maxLength: 2000
      responses:
        '200':
          description: Revision requested
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Collaboration'

  # ============================================================
  # VERIFICATIONS
  # ============================================================
  /verifications/business:
    post:
      tags: [Verifications]
      summary: Submit business verification documents
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [businessName, ownerName, gstNumber]
              properties:
                businessName:
                  type: string
                ownerName:
                  type: string
                ownerEmail:
                  type: string
                gstNumber:
                  type: string
                businessLicense:
                  type: string
                  format: binary
                addressProof:
                  type: string
                  format: binary
                gstCertificate:
                  type: string
                  format: binary
      responses:
        '200':
          description: Verification submitted for review
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BusinessProfile'

  /verifications/creator:
    post:
      tags: [Verifications]
      summary: Submit creator KYC documents
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [displayName, panNumber]
              properties:
                displayName:
                  type: string
                panNumber:
                  type: string
                  pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
                aadhaarNumber:
                  type: string
                  pattern: '^[0-9]{12}$'
                  nullable: true
                bankAccountNumber:
                  type: string
                  nullable: true
                bankIfsc:
                  type: string
                  pattern: '^[A-Z]{4}0[A-Z0-9]{6}$'
                  nullable: true
                kycDocument:
                  type: string
                  format: binary
      responses:
        '200':
          description: KYC submitted for review
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CreatorProfile'

  # ============================================================
  # PAYMENTS
  # ============================================================
  /payments/create-hold:
    post:
      tags: [Payments]
      summary: Create escrow hold for a collaboration (internal)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [collaborationId]
              properties:
                collaborationId:
                  type: string
      responses:
        '200':
          description: Escrow hold created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'

  /payments/release:
    post:
      tags: [Payments]
      summary: Release escrow payment to creator (triggered on approval)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [paymentId]
              properties:
                paymentId:
                  type: string
      responses:
        '200':
          description: Payment released to creator
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'

  /payments/refund:
    post:
      tags: [Payments]
      summary: Refund escrow to business (dispute resolution or cancellation)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [paymentId, amount]
              properties:
                paymentId:
                  type: string
                amount:
                  type: number
                  description: Amount to refund (in INR)
                reason:
                  type: string
      responses:
        '200':
          description: Refund processed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'

  /payments/webhooks/razorpay:
    post:
      tags: [Payments]
      summary: Razorpay webhook handler
      parameters:
        - name: X-Razorpay-Signature
          in: header
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: Webhook acknowledged

  /payments/transactions:
    get:
      tags: [Payments]
      summary: Get payment transaction history
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [all, payouts, payments, refunds]
        - name: startDate
          in: query
          schema:
            type: string
            format: date-time
        - name: endDate
          in: query
          schema:
            type: string
            format: date-time
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Transaction history
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedResponse'

  # ============================================================
  # DISPUTES
  # ============================================================
  /disputes:
    get:
      tags: [Disputes]
      summary: List disputes (filtered by role)
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [OPEN, UNDER_REVIEW, RESOLVED_BUSINESS, RESOLVED_CREATOR, RESOLVED_PARTIAL]
        - name: collaborationId
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Disputes list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Dispute'

    post:
      tags: [Disputes]
      summary: Raise a dispute on a collaboration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [collaborationId, category, reason]
              properties:
                collaborationId:
                  type: string
                category:
                  type: string
                  enum: [DELIVERABLE_QUALITY, PAYMENT, CANCELLATION, OTHER]
                reason:
                  type: string
                  maxLength: 5000
      responses:
        '201':
          description: Dispute created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Dispute'

  /disputes/{id}/resolve:
    post:
      tags: [Disputes]
      summary: Admin resolves a dispute
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [resolution, notes]
              properties:
                resolution:
                  type: string
                  enum: [BUSINESS, CREATOR, PARTIAL]
                refundAmount:
                  type: number
                  nullable: true
                payoutAmount:
                  type: number
                  nullable: true
                notes:
                  type: string
                  maxLength: 5000
      responses:
        '200':
          description: Dispute resolved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Dispute'

  # ============================================================
  # REVIEWS
  # ============================================================
  /reviews:
    post:
      tags: [Reviews]
      summary: Submit a review (after collaboration completion)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [collaborationId, revieweeId, reviewType, overallRating]
              properties:
                collaborationId:
                  type: string
                revieweeId:
                  type: string
                reviewType:
                  $ref: '#/components/schemas/ReviewType'
                overallRating:
                  type: integer
                  minimum: 1
                  maximum: 5
                criteriaRatings:
                  type: object
                  properties:
                    communication:
                      type: integer
                    quality:
                      type: integer
                    timeliness:
                      type: integer
                comment:
                  type: string
                  maxLength: 2000
      responses:
        '201':
          description: Review submitted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Review'

  /reviews/me:
    get:
      tags: [Reviews]
      summary: Get reviews for the current user
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [received, given]
      responses:
        '200':
          description: Reviews list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedResponse'

  /reviews/user/{userId}:
    get:
      tags: [Reviews]
      summary: Get public reviews for a user
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Public reviews
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedResponse'

  # ============================================================
  # CHAT
  # ============================================================
  /chat/threads:
    get:
      tags: [Chat]
      summary: List chat threads for current user
      responses:
        '200':
          description: Chat threads list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatThread'

  /chat/threads/{threadId}/messages:
    get:
      tags: [Chat]
      summary: Get messages in a thread
      parameters:
        - name: threadId
          in: path
          required: true
          schema:
            type: string
        - name: before
          in: query
          schema:
            type: string
            format: date-time
          description: Paginate before this timestamp
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
      responses:
        '200':
          description: Messages list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Message'
                  hasMore:
                    type: boolean

    post:
      tags: [Chat]
      summary: Send a message in a thread
      parameters:
        - name: threadId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [content]
              properties:
                content:
                  type: string
                  maxLength: 5000
                messageType:
                  type: string
                  enum: [TEXT, IMAGE, FILE]
                  default: TEXT
                attachmentUrl:
                  type: string
                  nullable: true
      responses:
        '201':
          description: Message sent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Message'

  # ============================================================
  # ADMIN
  # ============================================================
  /admin/verifications/pending:
    get:
      tags: [Admin]
      summary: Get pending verification queue
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      parameters:
        - name: type
          in: query
          schema:
            type: string
            enum: [CREATOR, BUSINESS]
        - name: page
          in: query
          schema:
            type: integer
          default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Pending verifications
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedResponse'

  /admin/verifications/{userId}/approve:
    post:
      tags: [Admin]
      summary: Approve user verification
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User verified

  /admin/verifications/{userId}/reject:
    post:
      tags: [Admin]
      summary: Reject user verification with reason
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [reason]
              properties:
                reason:
                  type: string
                  maxLength: 1000
      responses:
        '200':
          description: Verification rejected

  /admin/analytics/overview:
    get:
      tags: [Admin]
      summary: Platform analytics overview
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalCreators:
                    type: integer
                  totalBusinesses:
                    type: integer
                  totalCampaigns:
                    type: integer
                  totalCollaborations:
                    type: integer
                  platformGMV:
                    type: number
                  totalPlatformFees:
                    type: number
                  activeEscrow:
                    type: number
                  completionRate:
                    type: number
                    format: float
                  disputeRate:
                    type: number
                    format: float
                  revenueByMonth:
                    type: array
                    items:
                      type: object
                      properties:
                        month:
                          type: string
                        gmv:
                          type: number
                        fees:
                          type: number

  /admin/disputes:
    get:
      tags: [Admin]
      summary: List all disputes for admin review
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [OPEN, UNDER_REVIEW, RESOLVED_BUSINESS, RESOLVED_CREATOR, RESOLVED_PARTIAL, ESCALATED]
      responses:
        '200':
          description: Disputes list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedResponse'

  /admin/users/{userId}/ban:
    post:
      tags: [Admin]
      summary: Ban/unban a user
      security:
        - BearerAuth: [SUPER_ADMIN]
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [isBanned]
              properties:
                isBanned:
                  type: boolean
                reason:
                  type: string
                  nullable: true
      responses:
        '200':
          description: User ban status updated

  /admin/campaigns/featured:
    post:
      tags: [Admin]
      summary: Feature/unfeature a campaign
      security:
        - BearerAuth: [ADMIN, SUPER_ADMIN]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [campaignId, isFeatured]
              properties:
                campaignId:
                  type: string
                isFeatured:
                  type: boolean
                featuredUntil:
                  type: string
                  format: date-time
                  nullable: true
      responses:
        '200':
          description: Campaign featured status updated
```

---

## TypeScript Interface Definitions

```typescript
// src/api/types/api.types.ts

// ============================================================
// REQUEST/RESPONSE DTOs (matching the OpenAPI spec above)
// ============================================================

// --- Auth ---
export interface ExchangeFirebaseTokenRequest {
  firebaseToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// --- Campaigns ---
export interface CreateCampaignRequest {
  title: string;
  description: string;
  deliverableTypes: DeliverableType[];
  creatorCount: number;
  budgetType: 'FIXED' | 'RANGE';
  budgetMin?: number;
  budgetMax?: number;
  locationType?: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  locationCity?: string;
  locationState?: string;
  deadlineAt?: string;
  autoApproveAfterDays?: number;
}

export interface CampaignQueryParams {
  status?: string;
  category?: string;
  city?: string;
  deliverableType?: DeliverableType;
  budgetMin?: number;
  budgetMax?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// --- Collaborations ---
export interface CreateCollaborationRequest {
  campaignId: string;
  offeredAmount: number;
  proposalNote?: string;
}

export interface CounterOfferRequest {
  offeredAmount: number;
  negotiationNote?: string;
}

export interface SubmitDeliverablesRequest {
  deliverables: Array<{
    type: DeliverableType;
    url: string;
  }>;
}

export interface RequestRevisionRequest {
  revisionNote: string;
}

// --- Disputes ---
export interface RaiseDisputeRequest {
  collaborationId: string;
  category: 'DELIVERABLE_QUALITY' | 'PAYMENT' | 'CANCELLATION' | 'OTHER';
  reason: string;
}

export interface ResolveDisputeRequest {
  resolution: 'BUSINESS' | 'CREATOR' | 'PARTIAL';
  refundAmount?: number;
  payoutAmount?: number;
  notes: string;
}

// --- Reviews ---
export interface CreateReviewRequest {
  collaborationId: string;
  revieweeId: string;
  reviewType: 'BUSINESS_TO_CREATOR' | 'CREATOR_TO_BUSINESS';
  overallRating: number; // 1-5
  criteriaRatings?: {
    communication?: number;
    quality?: number;
    timeliness?: number;
  };
  comment?: string;
}

// --- Chat ---
export interface SendMessageRequest {
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  attachmentUrl?: string;
}

// ============================================================
// API Client (Axios-based)
// ============================================================

// src/api/client.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class ApiClient {
  private readonly client: AxiosInstance;

  constructor(accessToken?: string) {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.platform.com/v1',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired - trigger refresh
          return this.refreshTokenAndRetry(error);
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenAndRetry(error: any) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return Promise.reject(error);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken }
      );
      this.client.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
      return this.client.request(error.config);
    } catch {
      return Promise.reject(error);
    }
  }

  // Campaigns
  getCampaigns(params: CampaignQueryParams) {
    return this.client.get('/campaigns', { params });
  }

  getCampaign(id: string) {
    return this.client.get(`/campaigns/${id}`);
  }

  createCampaign(data: CreateCampaignRequest) {
    return this.client.post('/campaigns', data);
  }

  updateCampaign(id: string, data: Partial<CreateCampaignRequest>) {
    return this.client.patch(`/campaigns/${id}`, data);
  }

  getCampaignCollaborations(id: string) {
    return this.client.get(`/campaigns/${id}/collaborations`);
  }

  // Collaborations
  getCollaborations(params?: { status?: string; role?: string; page?: number }) {
    return this.client.get('/collaborations', { params });
  }

  getCollaboration(id: string) {
    return this.client.get(`/collaborations/${id}`);
  }

  createBid(data: CreateCollaborationRequest) {
    return this.client.post('/collaborations', data);
  }

  acceptOffer(id: string) {
    return this.client.post(`/collaborations/${id}/accept`);
  }

  sendCounterOffer(id: string, data: CounterOfferRequest) {
    return this.client.post(`/collaborations/${id}/counter-offer`, data);
  }

  lockPayment(id: string) {
    return this.client.post(`/collaborations/${id}/lock-payment`);
  }

  submitDeliverables(id: string, data: SubmitDeliverablesRequest) {
    return this.client.post(`/collaborations/${id}/submit-deliverables`, data);
  }

  approveDeliverables(id: string) {
    return this.client.post(`/collaborations/${id}/approve`);
  }

  requestRevision(id: string, data: RequestRevisionRequest) {
    return this.client.post(`/collaborations/${id}/request-revision`, data);
  }

  // Verifications
  submitBusinessVerification(formData: FormData) {
    return this.client.post('/verifications/business', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  submitCreatorVerification(formData: FormData) {
    return this.client.post('/verifications/creator', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  // Payments
  createEscrowHold(collaborationId: string) {
    return this.client.post('/payments/create-hold', { collaborationId });
  }

  releasePayment(paymentId: string) {
    return this.client.post('/payments/release', { paymentId });
  }

  processRefund(paymentId: string, amount: number, reason: string) {
    return this.client.post('/payments/refund', { paymentId, amount, reason });
  }

  getTransactions(params?: { type?: string; startDate?: string; endDate?: string; page?: number }) {
    return this.client.get('/payments/transactions', { params });
  }

  // Disputes
  getDisputes(params?: { status?: string; collaborationId?: string }) {
    return this.client.get('/disputes', { params });
  }

  raiseDispute(data: RaiseDisputeRequest) {
    return this.client.post('/disputes', data);
  }

  resolveDispute(id: string, data: ResolveDisputeRequest) {
    return this.client.post(`/disputes/${id}/resolve`, data);
  }

  // Reviews
  createReview(data: CreateReviewRequest) {
    return this.client.post('/reviews', data);
  }

  getMyReviews(type: 'received' | 'given', page = 1) {
    return this.client.get('/reviews/me', { params: { type, page } });
  }

  getUserReviews(userId: string, page = 1) {
    return this.client.get(`/reviews/user/${userId}`, { params: { page } });
  }

  // Chat
  getChatThreads() {
    return this.client.get('/chat/threads');
  }

  getMessages(threadId: string, before?: string, limit = 50) {
    return this.client.get(`/chat/threads/${threadId}/messages`, { params: { before, limit } });
  }

  sendMessage(threadId: string, data: SendMessageRequest) {
    return this.client.post(`/chat/threads/${threadId}/messages`, data);
  }

  // Admin
  getPendingVerifications(type?: 'CREATOR' | 'BUSINESS', page = 1) {
    return this.client.get('/admin/verifications/pending', { params: { type, page } });
  }

  approveVerification(userId: string) {
    return this.client.post(`/admin/verifications/${userId}/approve`);
  }

  rejectVerification(userId: string, reason: string) {
    return this.client.post(`/admin/verifications/${userId}/reject`, { reason });
  }

  getAdminAnalytics() {
    return this.client.get('/admin/analytics/overview');
  }

  getAdminDisputes(status?: string) {
    return this.client.get('/admin/disputes', { params: { status } });
  }
}

// Singleton instance
export const api = new ApiClient();
```

---

## API Rate Limits

| Endpoint Category | Limit |
|---|---|
| Authentication endpoints | 5 req/min |
| Campaign listing | 100 req/min |
| Campaign creation | 10 req/min |
| Chat messaging | 200 req/min |
| File uploads | 20 req/min |
| Admin endpoints | 500 req/min |
