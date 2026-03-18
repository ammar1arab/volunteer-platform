import { Notification } from "@/core/domain/entities";
import { NotificationType } from "@/core/domain/enums";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface TargetedUserRow {
  id: string;
  name: string;
  city: string | null;
  gender: string | null;
}

interface INotificationRepository {
  createMany(data: CreateNotificationInput[]): Promise<void>;
  findRecentByUserId(userId: string, limit?: number): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteAllBroadcasts(): Promise<void>;
  findRecentBroadcasts(limit?: number): Promise<Notification[]>;
  findTargetedUsers(target: string, targetValue?: string): Promise<TargetedUserRow[]>;
}

export default INotificationRepository;
