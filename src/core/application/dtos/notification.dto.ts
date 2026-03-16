import { NotificationType } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  link: string;
}

export interface UnreadNotificationsDto {
  notifications: NotificationDto[];
  unreadCount: number;
}

export type GetUnreadNotificationsResponse = Result<UnreadNotificationsDto>;
export type MarkAsReadResponse = Result<{ success: boolean }>;