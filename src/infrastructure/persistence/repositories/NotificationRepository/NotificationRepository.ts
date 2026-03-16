import INotificationRepository from "./INotificationRepository";
import type { Notification as PrismaNotification, NotificationType as PrismaNotificationType } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { Notification } from "@/core/domain/entities";
import { NotificationType } from "@/core/domain/enums";

class NotificationRepository implements INotificationRepository {
  private mapToEntity(data: PrismaNotification): Notification {
    return new Notification({
      ...data,
      type: data.type as NotificationType,
      metadata: (data.metadata as Record<string, unknown>) ?? null
    });
  }

  async createMany(
    data: {
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      metadata?: Record<string, unknown>;
    }[]
  ): Promise<void> {
    await prisma.notification.createMany({
      data: data.map((item) => ({
        userId: item.userId,
        type: item.type as PrismaNotificationType,
        title: item.title,
        message: item.message,
        metadata: item.metadata ? JSON.parse(JSON.stringify(item.metadata)) : undefined
      }))
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, updatedAt: new Date() }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, updatedAt: new Date() }
    });
  }
}

export default NotificationRepository;
