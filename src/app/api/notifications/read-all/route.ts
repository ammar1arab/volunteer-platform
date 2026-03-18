import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { apiError, unauthorized } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    logger.info("notifications/read-all", "POST", `userId=${session.user.id}`);
    const result = await providers.notification().markAllAsRead(session.user.id);
    return Response.json(result);
  } catch (error) {
    return apiError("notifications/read-all", "POST", error);
  }
}