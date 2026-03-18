import INotificationRepository, { CreateNotificationInput, TargetedUserRow } from "./INotificationRepository";
import type { Notification as PrismaNotification, NotificationType as PrismaNotificationType } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { Notification } from "@/core/domain/entities";
import { NotificationType } from "@/core/domain/enums";
import { JordanianCity, Gender } from "@prisma/client";

const KEEP_PER_USER = 50;

class NotificationRepository implements INotificationRepository {
  private mapToEntity(data: PrismaNotification): Notification {
    return new Notification({
      ...data,
      type:     data.type as NotificationType,
      metadata: (data.metadata as Record<string, unknown>) ?? null,
    });
  }

  async createMany(data: CreateNotificationInput[]): Promise<void> {
    if (!data.length) return;

    await prisma.notification.createMany({
      data: data.map((item) => ({
        userId:   item.userId,
        type:     item.type as PrismaNotificationType,
        title:    item.title,
        message:  item.message,
        metadata: item.metadata ? JSON.parse(JSON.stringify(item.metadata)) : undefined,
      })),
    });

    const uniqueUserIds = [...new Set(data.map((d) => d.userId))];

    void prisma.$executeRaw`
      DELETE FROM notifications
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
            ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) AS rn
          FROM notifications
          WHERE "userId" = ANY(${uniqueUserIds}::text[])
        ) ranked
        WHERE rn > ${KEEP_PER_USER}
      )
    `;
  }

  async findRecentByUserId(userId: string, limit = 30): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where:   { userId, isActive: true },
      orderBy: { createdAt: "desc" },
      take:    limit,
    });
    return rows.map((r) => this.mapToEntity(r));
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false, isActive: true },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data:  { isRead: true, updatedAt: new Date() },
    });
    if (result.count === 0) throw new Error("الإشعار غير موجود أو لا تملك صلاحية تعديله");
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data:  { isRead: true, updatedAt: new Date() },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.notification.deleteMany({ where: { userId } });
  }

  async deleteAllBroadcasts(): Promise<void> {
    await prisma.notification.deleteMany({ where: { type: "ANNOUNCEMENT" } });
  }

  async findRecentBroadcasts(limit = 20): Promise<Notification[]> {
    const rows = await prisma.$queryRaw<PrismaNotification[]>`
      SELECT * FROM (
        SELECT DISTINCT ON ((metadata->>'broadcastId')) *
        FROM notifications
        WHERE type = 'ANNOUNCEMENT'
        ORDER BY (metadata->>'broadcastId'), "createdAt" DESC
      ) sub
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => this.mapToEntity(r));
  }

  async findTargetedUsers(target: string, targetValue?: string): Promise<TargetedUserRow[]> {
    if (target === "ALL") {
      const rows = await prisma.user.findMany({
        where:  { role: "VOLUNTEER", isActive: true },
        select: { id: true, fullName: true, volunteerProfile: { select: { city: true, gender: true } } },
      });
      return rows.map((r) => ({
        id:     r.id,
        name:   r.fullName,
        city:   r.volunteerProfile?.city ?? null,
        gender: r.volunteerProfile?.gender ?? null,
      }));
    }

    if (target === "CITY") {
      const rows = await prisma.volunteerProfile.findMany({
        where:  { city: targetValue as JordanianCity, isActive: true },
        select: { userId: true, city: true, gender: true, user: { select: { fullName: true } } },
      });
      return rows.map((r) => ({
        id:     r.userId,
        name:   r.user.fullName,
        city:   r.city ?? null,
        gender: r.gender ?? null,
      }));
    }

    if (target === "GENDER") {
      const rows = await prisma.volunteerProfile.findMany({
        where:  { gender: targetValue as Gender, isActive: true },
        select: { userId: true, city: true, gender: true, user: { select: { fullName: true } } },
      });
      return rows.map((r) => ({
        id:     r.userId,
        name:   r.user.fullName,
        city:   r.city ?? null,
        gender: r.gender ?? null,
      }));
    }

    return [];
  }
}

export default NotificationRepository;