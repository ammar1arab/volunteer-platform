import { NotificationType } from "@/core/domain/enums";
import type { Result } from "./base.dto";
import type { NotificationMetadata } from "@/core/domain/interfaces";

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: NotificationMetadata | null;
  createdAt: string;
  link: string | null;
}

export interface NotificationsDto {
  notifications: NotificationDto[];
  unreadCount: number;
}

export interface BroadcastDto {
  broadcastId: string;
  title: string;
  message: string;
  totalRecipients: number;
  target: string;
  targetValue: string | null;
  link: string | null;
  createdAt: string;
}

export interface BroadcastRecipientDto {
  id: string;
  name: string;
  city: string | null;
  gender: string | null;
  hours: number;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  certifications?: number;
}

export interface BroadcastsDto {
  broadcasts: BroadcastDto[];
}

export interface PreviewUserDto {
  id: string;
  name: string;
  city: string | null;
  gender: string | null;
  hours?: number;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  certifications?: number;
}

export interface PreviewUsersDto {
  users: PreviewUserDto[];
}

export interface SendCustomNotificationInput {
  title: string;
  message: string;
  target: "ALL" | "CITY" | "GENDER" | "HOURS" | "USERS" | "ACTIVITY_PENDING" | "ACTIVITY_APPROVED";
  targetValue?: string;
  link?: string;
  userIds?: string[];
}

export type GetNotificationsResponse = Result<NotificationsDto>;
export type GetBroadcastsResponse = Result<BroadcastsDto>;
export type GetNotificationPreviewResponse = Result<PreviewUsersDto>;
export type GetBroadcastRecipientsResponse = Result<{ recipients: BroadcastRecipientDto[] }>;
export type MarkAsReadResponse = Result<{ success: boolean }>;
export type ClearNotificationsResponse = Result<{ success: boolean }>;
export type SendCustomNotificationResponse = Result<{ sent: number }>;
export type DeleteBroadcastResponse = Result<{ success: boolean }>;
export type GetUnreadNotificationsResponse = GetNotificationsResponse;
export type UnreadNotificationsDto = NotificationsDto;
