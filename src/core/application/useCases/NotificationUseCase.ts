import { NotificationRepository } from "@/infrastructure/persistence/repositories";
import { serviceError, guard } from "@/core/application/common";
import { toNotificationDto } from "@/core/application/mappers";
import { ok, GetUnreadNotificationsResponse, MarkAsReadResponse } from "@/core/application/dtos";
import { logger } from "@/lib/utils";

class NotificationUseCase {
  private static readonly SCOPE = "NotificationUseCase";

  constructor(private notificationRepository: NotificationRepository) {}

  async getUnread(userId: string): Promise<GetUnreadNotificationsResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");

      const [notifications, unreadCount] = await Promise.all([
        this.notificationRepository.findUnreadByUserId(userId),
        this.notificationRepository.countUnreadByUserId(userId)
      ]);

      logger.info(NotificationUseCase.SCOPE, "getUnread", `unreadCount=${unreadCount} for: ${userId}`);
      return ok({
        notifications: notifications.map(toNotificationDto),
        unreadCount
      });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "getUnread", error, "حدث خطأ أثناء جلب الإشعارات");
    }
  }

  async markAsRead(id: string, userId: string): Promise<MarkAsReadResponse> {
    try {
      guard(id, "معرّف الإشعار مطلوب");
      await this.notificationRepository.markAsRead(id, userId);
      logger.info(NotificationUseCase.SCOPE, "markAsRead", `id=${id}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "markAsRead", error, "حدث خطأ أثناء تحديث الإشعار");
    }
  }

  async markAllAsRead(userId: string): Promise<MarkAsReadResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");
      await this.notificationRepository.markAllAsRead(userId);
      logger.info(NotificationUseCase.SCOPE, "markAllAsRead", `userId=${userId}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "markAllAsRead", error, "حدث خطأ أثناء تحديث الإشعارات");
    }
  }
}

export default NotificationUseCase;
