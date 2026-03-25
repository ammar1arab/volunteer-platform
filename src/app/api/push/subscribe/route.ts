import { getServerSession } from "next-auth";
import { authOptions }      from "@/infrastructure/auth/config";
import { prisma }           from "@/infrastructure/persistence/prisma";
import { unauthorized, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    const body = await req.json().catch(() => null);
    const { endpoint, keys } = body ?? {};

    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return Response.json({ success: false, error: "invalid payload" }, { status: 400 });

    await prisma.pushSubscription.upsert({
      where:  { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, updatedAt: new Date() },
      create: {
        userId:   session.user.id,
        endpoint,
        p256dh:   keys.p256dh,
        auth:     keys.auth,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    return apiError("push", "POST /subscribe", error);
  }
}