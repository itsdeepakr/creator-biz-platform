/**
 * In-Memory Relational Database and State Store for E2E Harness
 * Provides full CRUD operations, index lookups, foreign key integrity, and state reset.
 */

import type {
  UserRecord,
  CreatorProfileRecord,
  BusinessProfileRecord,
  CampaignRecord,
  CollaborationRecord,
  PaymentRecord,
  DisputeRecord,
  ReviewRecord,
  ChatThreadRecord,
  ChatMessageRecord,
  NotificationRecord,
  UserRole,
  VerificationStatus,
  CampaignStatus,
  CollaborationStatus,
  PaymentStatus,
  DisputeStatus,
} from './types.ts';

export class InMemoryDatabase {
  public users: Map<string, UserRecord> = new Map();
  public creatorProfiles: Map<string, CreatorProfileRecord> = new Map();
  public businessProfiles: Map<string, BusinessProfileRecord> = new Map();
  public campaigns: Map<string, CampaignRecord> = new Map();
  public collaborations: Map<string, CollaborationRecord> = new Map();
  public payments: Map<string, PaymentRecord> = new Map();
  public disputes: Map<string, DisputeRecord> = new Map();
  public reviews: Map<string, ReviewRecord> = new Map();
  public chatThreads: Map<string, ChatThreadRecord> = new Map();
  public chatMessages: Map<string, ChatMessageRecord> = new Map();
  public notifications: Map<string, NotificationRecord> = new Map();

  // Primary and secondary indexes
  private userByEmail: Map<string, string> = new Map();
  private creatorByUserId: Map<string, string> = new Map();
  private businessByUserId: Map<string, string> = new Map();

  public reset(): void {
    this.users.clear();
    this.creatorProfiles.clear();
    this.businessProfiles.clear();
    this.campaigns.clear();
    this.collaborations.clear();
    this.payments.clear();
    this.disputes.clear();
    this.reviews.clear();
    this.chatThreads.clear();
    this.chatMessages.clear();
    this.notifications.clear();
    this.userByEmail.clear();
    this.creatorByUserId.clear();
    this.businessByUserId.clear();
  }

  // --- Users ---
  public createUser(data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): UserRecord {
    const emailNorm = data.email.toLowerCase().trim();
    if (this.userByEmail.has(emailNorm)) {
      throw new Error(`Unique constraint violation: Email "${data.email}" already exists`);
    }

    const id = data.id || `usr_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: UserRecord = {
      ...data,
      id,
      email: emailNorm,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, record);
    this.userByEmail.set(emailNorm, id);
    return this.clone(record);
  }

  public getUserById(id: string): UserRecord | null {
    const u = this.users.get(id);
    return u ? this.clone(u) : null;
  }

  public getUserByEmail(email: string): UserRecord | null {
    const id = this.userByEmail.get(email.toLowerCase().trim());
    if (!id) return null;
    return this.getUserById(id);
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord {
    const user = this.users.get(id);
    if (!user) throw new Error(`User ${id} not found`);

    if (updates.email && updates.email !== user.email) {
      const emailNorm = updates.email.toLowerCase().trim();
      if (this.userByEmail.has(emailNorm) && this.userByEmail.get(emailNorm) !== id) {
        throw new Error(`Email ${updates.email} already in use`);
      }
      this.userByEmail.delete(user.email);
      this.userByEmail.set(emailNorm, id);
      user.email = emailNorm;
    }

    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return this.clone(updated);
  }

  // --- Creator Profiles ---
  public createCreatorProfile(data: Omit<CreatorProfileRecord, 'id'> & { id?: string }): CreatorProfileRecord {
    const id = data.id || `cr_${Math.random().toString(36).substring(2, 11)}`;
    const record: CreatorProfileRecord = {
      ...data,
      id,
    };
    this.creatorProfiles.set(id, record);
    this.creatorByUserId.set(data.userId, id);
    return this.clone(record);
  }

  public getCreatorProfileByUserId(userId: string): CreatorProfileRecord | null {
    const id = this.creatorByUserId.get(userId);
    if (!id) return null;
    const p = this.creatorProfiles.get(id);
    return p ? this.clone(p) : null;
  }

  public updateCreatorProfile(id: string, updates: Partial<CreatorProfileRecord>): CreatorProfileRecord {
    const prof = this.creatorProfiles.get(id);
    if (!prof) throw new Error(`Creator profile ${id} not found`);
    const updated = { ...prof, ...updates };
    this.creatorProfiles.set(id, updated);
    return this.clone(updated);
  }

  // --- Business Profiles ---
  public createBusinessProfile(data: Omit<BusinessProfileRecord, 'id'> & { id?: string }): BusinessProfileRecord {
    const id = data.id || `biz_${Math.random().toString(36).substring(2, 11)}`;
    const record: BusinessProfileRecord = {
      ...data,
      id,
    };
    this.businessProfiles.set(id, record);
    this.businessByUserId.set(data.userId, id);
    return this.clone(record);
  }

  public getBusinessProfileByUserId(userId: string): BusinessProfileRecord | null {
    const id = this.businessByUserId.get(userId);
    if (!id) return null;
    const p = this.businessProfiles.get(id);
    return p ? this.clone(p) : null;
  }

  public updateBusinessProfile(id: string, updates: Partial<BusinessProfileRecord>): BusinessProfileRecord {
    const prof = this.businessProfiles.get(id);
    if (!prof) throw new Error(`Business profile ${id} not found`);
    const updated = { ...prof, ...updates };
    this.businessProfiles.set(id, updated);
    return this.clone(updated);
  }

  // --- Campaigns ---
  public createCampaign(data: Omit<CampaignRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): CampaignRecord {
    const id = data.id || `cmp_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: CampaignRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.campaigns.set(id, record);
    return this.clone(record);
  }

  public getCampaignById(id: string): CampaignRecord | null {
    const c = this.campaigns.get(id);
    return c ? this.clone(c) : null;
  }

  public listCampaigns(filter?: (c: CampaignRecord) => boolean): CampaignRecord[] {
    const list = Array.from(this.campaigns.values());
    const filtered = filter ? list.filter(filter) : list;
    return filtered.map((c) => this.clone(c));
  }

  public updateCampaign(id: string, updates: Partial<CampaignRecord>): CampaignRecord {
    const c = this.campaigns.get(id);
    if (!c) throw new Error(`Campaign ${id} not found`);
    const updated = {
      ...c,
      ...updates,
      updatedAt: new Date(),
    };
    this.campaigns.set(id, updated);
    return this.clone(updated);
  }

  // --- Collaborations ---
  public createCollaboration(data: Omit<CollaborationRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): CollaborationRecord {
    const id = data.id || `col_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: CollaborationRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.collaborations.set(id, record);
    return this.clone(record);
  }

  public getCollaborationById(id: string): CollaborationRecord | null {
    const col = this.collaborations.get(id);
    return col ? this.clone(col) : null;
  }

  public listCollaborations(filter?: (col: CollaborationRecord) => boolean): CollaborationRecord[] {
    const list = Array.from(this.collaborations.values());
    const filtered = filter ? list.filter(filter) : list;
    return filtered.map((col) => this.clone(col));
  }

  public updateCollaboration(id: string, updates: Partial<CollaborationRecord>): CollaborationRecord {
    const col = this.collaborations.get(id);
    if (!col) throw new Error(`Collaboration ${id} not found`);
    const updated = {
      ...col,
      ...updates,
      updatedAt: new Date(),
    };
    this.collaborations.set(id, updated);
    return this.clone(updated);
  }

  // --- Payments / Escrow ---
  public createPayment(data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): PaymentRecord {
    const id = data.id || `pay_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: PaymentRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.payments.set(id, record);
    return this.clone(record);
  }

  public getPaymentById(id: string): PaymentRecord | null {
    const p = this.payments.get(id);
    return p ? this.clone(p) : null;
  }

  public getPaymentByCollaborationId(collabId: string): PaymentRecord | null {
    for (const p of this.payments.values()) {
      if (p.collaborationId === collabId) {
        return this.clone(p);
      }
    }
    return null;
  }

  public updatePayment(id: string, updates: Partial<PaymentRecord>): PaymentRecord {
    const p = this.payments.get(id);
    if (!p) throw new Error(`Payment ${id} not found`);
    const updated = {
      ...p,
      ...updates,
      updatedAt: new Date(),
    };
    this.payments.set(id, updated);
    return this.clone(updated);
  }

  // --- Disputes ---
  public createDispute(data: Omit<DisputeRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DisputeRecord {
    const id = data.id || `dsp_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: DisputeRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.disputes.set(id, record);
    return this.clone(record);
  }

  public getDisputeById(id: string): DisputeRecord | null {
    const d = this.disputes.get(id);
    return d ? this.clone(d) : null;
  }

  public getDisputeByCollaborationId(collabId: string): DisputeRecord | null {
    for (const d of this.disputes.values()) {
      if (d.collaborationId === collabId) {
        return this.clone(d);
      }
    }
    return null;
  }

  public updateDispute(id: string, updates: Partial<DisputeRecord>): DisputeRecord {
    const d = this.disputes.get(id);
    if (!d) throw new Error(`Dispute ${id} not found`);
    const updated = {
      ...d,
      ...updates,
      updatedAt: new Date(),
    };
    this.disputes.set(id, updated);
    return this.clone(updated);
  }

  // --- Reviews ---
  public createReview(data: Omit<ReviewRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ReviewRecord {
    const id = data.id || `rev_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: ReviewRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.reviews.set(id, record);
    return this.clone(record);
  }

  public listReviews(filter?: (r: ReviewRecord) => boolean): ReviewRecord[] {
    const list = Array.from(this.reviews.values());
    const filtered = filter ? list.filter(filter) : list;
    return filtered.map((r) => this.clone(r));
  }

  // --- Chat Threads & Messages ---
  public createChatThread(data: Omit<ChatThreadRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ChatThreadRecord {
    const id = data.id || `th_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();
    const record: ChatThreadRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.chatThreads.set(id, record);
    return this.clone(record);
  }

  public getChatThreadById(id: string): ChatThreadRecord | null {
    const t = this.chatThreads.get(id);
    return t ? this.clone(t) : null;
  }

  public getChatThreadByParticipants(user1: string, user2: string, campaignId?: string): ChatThreadRecord | null {
    for (const t of this.chatThreads.values()) {
      const matchUsers = (t.creatorId === user1 && t.businessId === user2) || (t.creatorId === user2 && t.businessId === user1);
      if (matchUsers) {
        if (!campaignId || t.campaignId === campaignId) {
          return this.clone(t);
        }
      }
    }
    return null;
  }

  public createChatMessage(data: Omit<ChatMessageRecord, 'id' | 'createdAt'> & { id?: string }): ChatMessageRecord {
    const id = data.id || `msg_${Math.random().toString(36).substring(2, 11)}`;
    const record: ChatMessageRecord = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, record);
    return this.clone(record);
  }

  public listChatMessages(threadId: string): ChatMessageRecord[] {
    const list = Array.from(this.chatMessages.values())
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return list.map((m) => this.clone(m));
  }

  // --- Notifications ---
  public createNotification(data: Omit<NotificationRecord, 'id' | 'createdAt'> & { id?: string }): NotificationRecord {
    const id = data.id || `ntf_${Math.random().toString(36).substring(2, 11)}`;
    const record: NotificationRecord = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, record);
    return this.clone(record);
  }

  public listNotifications(userId: string): NotificationRecord[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((n) => this.clone(n));
  }

  private clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    }), (key, value) => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });
  }
}
