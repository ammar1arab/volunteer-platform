import { prisma } from "@/infrastructure/persistence/prisma";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/utils";
import { ActivityType, ActivityStatus, NotificationType } from "@/core/domain/enums";
import { ROUTES } from "@/presentation/constants";

const SCOPE = "activityReminders";

export const activityReminders = inngest.createFunction(
  { id: "activity-reminders", name: "Activity Reminders", retries: 2 },
  { cron: "0 * * * *" },
  async ({ step }) => {
    const now = new Date();

    const inPersonActivities = await step.run("fetch-in-person", async () => {
      const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      return prisma.activity.findMany({
        where: { status: ActivityStatus.PUBLISHED, activityType: ActivityType.IN_PERSON, date: { gte: from, lte: to } },
        select: { id: true, title: true, startTime: true }
      });
    });

    const onlineActivities = await step.run("fetch-online", async () => {
      const from = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
      const to = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);
      return prisma.activity.findMany({
        where: { status: ActivityStatus.PUBLISHED, activityType: ActivityType.ONLINE, date: { gte: from, lte: to } },
        select: { id: true, title: true, startTime: true }
      });
    });

    const allActivities = [
      ...inPersonActivities.map((a) => ({ ...a, type: ActivityType.IN_PERSON })),
      ...onlineActivities.map((a) => ({ ...a, type: ActivityType.ONLINE }))
    ];

    if (!allActivities.length) {
      logger.info(SCOPE, "cron", "No activities in reminder window");
      return { sent: 0 };
    }

    let totalSent = 0;

    for (const activity of allActivities) {
      await step.run(`remind-${activity.id}`, async () => {
        const participants = await prisma.activityParticipation.findMany({
          where: { activityId: activity.id, status: "APPROVED" },
          select: { volunteerId: true }
        });

        if (!participants.length) return;

        const volunteerIds = participants.map((p) => p.volunteerId);
        const alreadyNotified = await prisma.notification.findMany({
          where: {
            type: NotificationType.ACTIVITY_REMINDER,
            userId: { in: volunteerIds },
            metadata: { path: ["activityId"], equals: activity.id }
          },
          select: { userId: true }
        });

        const alreadySentIds = new Set(alreadyNotified.map((n) => n.userId));
        const toNotify = volunteerIds.filter((id) => !alreadySentIds.has(id));

        if (!toNotify.length) {
          logger.info(SCOPE, `remind-${activity.id}`, "All volunteers already notified");
          return;
        }

        const isInPerson = activity.type === ActivityType.IN_PERSON;

        const title = isInPerson ? "تذكير بموعد نشاطك غداً" : "نشاطك الإلكتروني يبدأ قريباً";

        const message = isInPerson
          ? `نشاط "${activity.title}" سيكون غداً الساعة ${activity.startTime}. احرص على الحضور في الوقت المحدد.`
          : `نشاط "${activity.title}" سيبدأ خلال 3 ساعات الساعة ${activity.startTime}. تأكد من جاهزية رابط الاجتماع.`;

        await prisma.notification.createMany({
          data: toNotify.map((userId) => ({
            userId,
            type: NotificationType.ACTIVITY_REMINDER,
            title,
            message,
            metadata: {
              activityId: activity.id,
              activityType: activity.type,
              link: ROUTES.ACTIVITY_DETAILS(activity.id)
            }
          }))
        });

        totalSent += toNotify.length;
        logger.info(SCOPE, `remind-${activity.id}`, `Sent ${toNotify.length} reminders activityType=${activity.type}`);
      });
    }

    logger.info(SCOPE, "cron", `Total reminders sent=${totalSent}`);
    return { sent: totalSent };
  }
);
