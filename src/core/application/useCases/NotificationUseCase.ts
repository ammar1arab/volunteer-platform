import { NotificationRepository } from "@/infrastructure/persistence/repositories";
import { serviceError, guard } from "@/core/application/common";
import { toNotificationDto, toBroadcastDto } from "@/core/application/mappers";
import { NotificationType } from "@/core/domain/enums";
import { logger } from "@/lib/utils";
import {
  ok,
  GetNotificationsResponse,
  GetBroadcastsResponse,
  GetNotificationPreviewResponse,
  MarkAsReadResponse,
  ClearNotificationsResponse,
  SendCustomNotificationResponse,
  DeleteBroadcastResponse,
  GetBroadcastRecipientsResponse
} from "@/core/application/dtos";

class NotificationUseCase {
  private static readonly SCOPE = "NotificationUseCase";

  constructor(private repo: NotificationRepository) {}

  async getRecent(userId: string): Promise<GetNotificationsResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");
      const [notifications, unreadCount] = await Promise.all([
        this.repo.findRecentByUserId(userId, 30),
        this.repo.countUnreadByUserId(userId),
      ]);
      logger.info(NotificationUseCase.SCOPE, "getRecent", `unreadCount=${unreadCount} userId=${userId}`);
      return ok({ notifications: notifications.map(toNotificationDto), unreadCount });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "getRecent", error, "حدث خطأ أثناء جلب الإشعارات");
    }
  }

  async markAsRead(id: string, userId: string): Promise<MarkAsReadResponse> {
    try {
      guard(id,     "معرّف الإشعار مطلوب");
      guard(userId, "معرّف المستخدم مطلوب");
      await this.repo.markAsRead(id, userId);
      logger.info(NotificationUseCase.SCOPE, "markAsRead", `id=${id}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "markAsRead", error, "حدث خطأ أثناء تحديث الإشعار");
    }
  }

  async markAllAsRead(userId: string): Promise<MarkAsReadResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");
      await this.repo.markAllAsRead(userId);
      logger.info(NotificationUseCase.SCOPE, "markAllAsRead", `userId=${userId}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "markAllAsRead", error, "حدث خطأ أثناء تحديث الإشعارات");
    }
  }

  async clearHistory(userId: string): Promise<ClearNotificationsResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");
      await this.repo.deleteByUserId(userId);
      logger.info(NotificationUseCase.SCOPE, "clearHistory", `userId=${userId}`);
      return ok({ success: true });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "clearHistory", error, "حدث خطأ أثناء مسح الإشعارات");
    }
  }

  async clearBroadcasts(): Promise<ClearNotificationsResponse> {
    try {
      await this.repo.deleteAllBroadcasts();
      logger.info(NotificationUseCase.SCOPE, "clearBroadcasts", "done");
      return ok({ success: true });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "clearBroadcasts", error, "حدث خطأ أثناء مسح السجل");
    }
  }

  async previewTargets(target: string, targetValue?: string): Promise<GetNotificationPreviewResponse> {
    try {
      guard(target, "نوع الاستهداف مطلوب");
      const users = await this.repo.findTargetedUsers(target, targetValue);
      logger.info(NotificationUseCase.SCOPE, "previewTargets", `target=${target} count=${users.length}`);
      return ok({ users });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "previewTargets", error, "حدث خطأ أثناء جلب البيانات");
    }
  }

  async sendCustom(input: {
    targetUserIds: string[];
    title:         string;
    message:       string;
    link?:         string;
    target:        string;
    targetValue?:  string;
  }): Promise<SendCustomNotificationResponse> {
    try {
      if (!input.targetUserIds.length) return ok({ sent: 0 });
      const broadcastId = crypto.randomUUID();
      await this.repo.createMany(
        input.targetUserIds.map((userId) => ({
          userId,
          type:    NotificationType.ANNOUNCEMENT,
          title:   input.title,
          message: input.message,
          metadata: {
            broadcastId,
            totalRecipients: input.targetUserIds.length,
            target:          input.target,
            targetValue:     input.targetValue ?? null,
            link:            input.link ?? null,
          },
        }))
      );
      logger.info(NotificationUseCase.SCOPE, "sendCustom", `broadcastId=${broadcastId} sent=${input.targetUserIds.length}`);
      return ok({ sent: input.targetUserIds.length });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "sendCustom", error, "حدث خطأ أثناء إرسال الإشعارات");
    }
  }

  async getRecentBroadcasts(): Promise<GetBroadcastsResponse> {
    try {
      const rows = await this.repo.findRecentBroadcasts(20);
      return ok({ broadcasts: rows.map(toBroadcastDto) });
    } catch (error) {
      return serviceError(NotificationUseCase.SCOPE, "getRecentBroadcasts", error, "حدث خطأ أثناء جلب السجلات");
    }
  }

  async getBroadcastRecipients(broadcastId: string): Promise<GetBroadcastRecipientsResponse> {
  try {
    guard(broadcastId, "معرّف الإشعار مطلوب");
    const recipients = await this.repo.findRecipientsByBroadcastId(broadcastId);
    logger.info(NotificationUseCase.SCOPE, "getBroadcastRecipients", `broadcastId=${broadcastId} count=${recipients.length}`);
    return ok({ recipients });
  } catch (error) {
    return serviceError(NotificationUseCase.SCOPE, "getBroadcastRecipients", error, "حدث خطأ أثناء جلب المستقبلين");
  }
}

async deleteBroadcast(broadcastId: string): Promise<DeleteBroadcastResponse> {
  try {
    guard(broadcastId, "معرّف الإشعار مطلوب");
    await this.repo.deleteByBroadcastId(broadcastId);
    logger.info(NotificationUseCase.SCOPE, "deleteBroadcast", `broadcastId=${broadcastId}`);
    return ok({ success: true });
  } catch (error) {
    return serviceError(NotificationUseCase.SCOPE, "deleteBroadcast", error, "حدث خطأ أثناء حذف الإشعار");
  }
}
}

export default NotificationUseCase;