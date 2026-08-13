import webpush from "web-push";
import { prisma } from "@/infrastructure/persistence/prisma";

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;
  tag?:  string;
}

async function cleanDead(endpoints: string[]): Promise<void> {
  if (!endpoints.length) return;
  await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: endpoints } } });
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return;

  const dead: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          { TTL: 86400 },
        );
      } catch (err) {
        const statusCode =
          err instanceof Error && "statusCode" in err && typeof err.statusCode === "number"
            ? err.statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          dead.push(sub.endpoint);
        }
      }
    })
  );

  void cleanDead(dead);
}

export async function sendPushToMany(userIds: string[], payload: PushPayload): Promise<void> {
  if (!userIds.length) return;
  await Promise.allSettled(userIds.map(id => sendPushToUser(id, payload)));
}