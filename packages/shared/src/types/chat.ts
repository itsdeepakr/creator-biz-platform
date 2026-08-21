import { ChatReportReason } from './enums';

export interface MessageDto {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  senderAvatarUrl?: string | null;
  senderRole?: string;
  content: string;
  messageType: 'text' | 'image' | 'document' | 'offer' | 'system' | string;
  mediaUrls: string[];
  isFlagged: boolean;
  flagReason?: string | null;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChatThreadDto {
  id: string;
  creatorId: string;
  creatorDisplayName?: string;
  creatorAvatarUrl?: string | null;
  businessId: string;
  businessName?: string;
  businessLogoUrl?: string | null;
  campaignId?: string | null;
  campaignTitle?: string | null;
  isActive: boolean;
  closedAt?: Date | string | null;
  offPlatformContactDetected: boolean;
  warningCount: number;
  lastMessage?: MessageDto | null;
  unreadCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SendMessageDto {
  threadId: string;
  content: string;
  messageType?: 'text' | 'image' | 'document' | 'offer' | 'system' | string;
  mediaUrls?: string[];
}

export interface CreateChatThreadDto {
  creatorId: string;
  businessId: string;
  campaignId?: string;
}

export interface ReportChatDto {
  chatThreadId: string;
  reason: ChatReportReason;
  description?: string;
}

export interface ChatReportDto {
  id: string;
  reporterId: string;
  chatThreadId: string;
  reason: ChatReportReason;
  description?: string | null;
  status: string;
  resolvedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface WebSocketChatMessage {
  event: string;
  data: {
    threadId: string;
    content: string;
    senderId: string;
    mediaUrls?: string[];
    messageType?: string;
    createdAt?: string;
  };
}

export interface WebSocketTypingPayload {
  threadId: string;
  userId: string;
  isTyping: boolean;
}

export interface WebSocketReadPayload {
  threadId: string;
  userId: string;
  messageId: string;
}
