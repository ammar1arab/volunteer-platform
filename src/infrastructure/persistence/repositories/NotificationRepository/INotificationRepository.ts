import type { Notification } from "@/core/domain/entities";

export interface CreateNotificationInput {
  userId:    string;
  type:      string;
  title:     string;
  message:   string;
  metadata?: Record<string, unknown>;
}

export interface TargetedUserRow {
  id:     string;
  name:   string;
  city:   string | null;
  gender: string | null;
  hours?: number;
}

export interface BroadcastRecipientRow {
  id:     string;
  name:   string;
  city:   string | null;
  gender: string | null;
  hours:  number;
}

interface INotificationRepository {
  createMany(data: CreateNotificationInput[]): Promise<void>;
  findRecentByUserId(userId: string, limit?: number): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteAllBroadcasts(): Promise<void>;
  deleteByBroadcastId(broadcastId: string): Promise<void>;
  findRecentBroadcasts(limit?: number): Promise<Notification[]>;
  findTargetedUsers(target: string, targetValue?: string, userIds?: string[]): Promise<TargetedUserRow[]>;
  findRecipientsByBroadcastId(broadcastId: string): Promise<BroadcastRecipientRow[]>;
}

export default INotificationRepository;