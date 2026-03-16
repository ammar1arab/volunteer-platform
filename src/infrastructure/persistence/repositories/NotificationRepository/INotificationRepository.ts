import { Notification } from "@/core/domain/entities";
import { NotificationType } from "@/core/domain/enums";

interface INotificationRepository {
  createMany(
    data: {
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      metadata?: Record<string, unknown>;
    }[]
  ): Promise<void>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export default INotificationRepository;
