import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { apiError, unauthorized } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return unauthorized();

    logger.info("notifications/read", "POST", `id=${id} userId=${session.user.id}`);
    const result = await providers.notification().markAsRead(id, session.user.id);
    return Response.json(result);
  } catch (error) {
    return apiError("notifications/read", "POST", error);
  }
}
