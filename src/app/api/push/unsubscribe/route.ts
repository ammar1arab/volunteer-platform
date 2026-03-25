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
    const { endpoint } = body ?? {};

    if (endpoint) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId: session.user.id },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return apiError("push", "POST /unsubscribe", error);
  }
}