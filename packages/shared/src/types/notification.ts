import { NotificationChannel, NotificationType } from './enums';

export interface NotificationDto {
  id: string;
  userId: string;
  type: string | NotificationType;
  title: string;
  body: string;
  data?: Record<string, any> | null;
  channels: NotificationChannel[];
  readAt?: Date | string | null;
  createdAt: Date | string;
}

export interface CreateNotificationDto {
  userId: string;
  type: string | NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
}

export interface MarkNotificationReadDto {
  notificationIds?: string[];
  all?: boolean;
}
