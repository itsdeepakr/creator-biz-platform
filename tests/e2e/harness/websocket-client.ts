/**
 * WebSocket Chat Gateway Simulator for E2E Tests
 * Simulates NestJS Socket.io Chat Gateway (/chat) with anti-disintermediation filters.
 */

import { InMemoryDatabase } from './database-client.ts';
import { UserRole } from './types.ts';
import type { ChatMessageRecord } from './types.ts';

export interface WebSocketMessagePayload {
  threadId: string;
  senderId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM';
  mediaUrls?: string[];
}

export interface WebSocketEventCallback {
  (event: string, data: any): void;
}

export class WebSocketClientSimulator {
  private listeners: Map<string, WebSocketEventCallback[]> = new Map();
  private connectedUserId: string | null = null;
  private userRole: UserRole | null = null;
  private activeRoom: string | null = null;
  private db: InMemoryDatabase;

  constructor(db: InMemoryDatabase) {
    this.db = db;
  }

  public connect(token: string): { connected: boolean; userId: string; role: UserRole } {
    if (token && token.startsWith('mock_jwt:')) {
      const [, userId, role] = token.split(':');
      this.connectedUserId = userId;
      this.userRole = role as UserRole;
      return { connected: true, userId, role: this.userRole };
    }
    throw new Error(`Invalid WebSocket auth token: ${token}`);
  }

  public disconnect(): void {
    this.connectedUserId = null;
    this.userRole = null;
    this.activeRoom = null;
    this.listeners.clear();
  }

  public joinThread(threadId: string): { success: boolean; threadId: string; messages: ChatMessageRecord[] } {
    if (!this.connectedUserId) throw new Error('Unauthorized: WebSocket client not connected');
    const thread = this.db.getChatThreadById(threadId);
    if (!thread) throw new Error(`Chat thread ${threadId} not found`);

    if (thread.creatorId !== this.connectedUserId && thread.businessId !== this.connectedUserId && this.userRole !== UserRole.ADMIN) {
      throw new Error(`Forbidden: User ${this.connectedUserId} is not a participant in thread ${threadId}`);
    }

    this.activeRoom = threadId;
    const messages = this.db.listChatMessages(threadId);
    this.emitEvent('userJoined', { threadId, userId: this.connectedUserId });
    return { success: true, threadId, messages };
  }

  public sendMessage(payload: WebSocketMessagePayload): ChatMessageRecord {
    if (!this.connectedUserId) throw new Error('Unauthorized: WebSocket client not connected');
    const thread = this.db.getChatThreadById(payload.threadId);
    if (!thread) throw new Error(`Chat thread ${payload.threadId} not found`);

    // Anti-disintermediation scanning
    const scan = this.scanAntiDisintermediation(payload.content);
    let isFlagged = scan.flagged;
    let flagReason = scan.reason;

    if (isFlagged) {
      thread.offPlatformContactDetected = true;
      thread.warningCount += 1;
      this.db.chatThreads.set(thread.id, thread);
    }

    const message = this.db.createChatMessage({
      threadId: payload.threadId,
      senderId: this.connectedUserId,
      content: payload.content,
      messageType: payload.messageType || 'TEXT',
      mediaUrls: payload.mediaUrls || [],
      isFlagged,
      flagReason,
      isDeleted: false,
    });

    this.emitEvent('newMessage', message);
    if (isFlagged) {
      this.emitEvent('warningOffPlatformContact', {
        threadId: thread.id,
        warningCount: thread.warningCount,
        reason: flagReason,
      });
    }

    return message;
  }

  public sendTyping(threadId: string, isTyping: boolean): void {
    if (!this.connectedUserId) throw new Error('Unauthorized: WebSocket client not connected');
    this.emitEvent('typing', { threadId, userId: this.connectedUserId, isTyping });
  }

  public on(event: string, callback: WebSocketEventCallback): void {
    const arr = this.listeners.get(event) || [];
    arr.push(callback);
    this.listeners.set(event, arr);
  }

  private emitEvent(event: string, data: any): void {
    const cbs = this.listeners.get(event) || [];
    for (const cb of cbs) {
      cb(event, data);
    }
  }

  /**
   * Anti-Disintermediation / Off-platform filter
   * Flags phone numbers, emails, WhatsApp keywords, UPI handles, external links
   */
  private scanAntiDisintermediation(content: string): { flagged: boolean; reason?: string } {
    const text = content.toLowerCase();

    // 1. Phone numbers (Indian 10-digit formats with or without +91 / 0 / spaces / dashes)
    const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}|\b[6-9]\d{9}\b/;
    if (phoneRegex.test(content)) {
      return { flagged: true, reason: 'Detected phone number pattern in message' };
    }

    // 2. Email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailRegex.test(content)) {
      return { flagged: true, reason: 'Detected email address in message' };
    }

    // 3. Off-platform contact keywords & messaging apps
    const offPlatformKeywords = [
      'whatsapp', 'wa.me', 'telegram', 't.me', 'call me', 'phone me',
      'gpay', 'phonepe', 'paytm', '@okaxis', '@okhdfcbank', '@oksbi',
      'direct transfer', 'bank transfer outside', 'pay outside'
    ];
    for (const kw of offPlatformKeywords) {
      if (text.includes(kw)) {
        return { flagged: true, reason: `Detected off-platform communication / payment keyword "${kw}"` };
      }
    }

    return { flagged: false };
  }
}
