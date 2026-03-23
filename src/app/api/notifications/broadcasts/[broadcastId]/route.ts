import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { apiError, unauthorized } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import { logger } from "@/lib/utils";
import { UserRole } from "@/core/domain/enums";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ broadcastId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return unauthorized();
    const { broadcastId } = await ctx.params;
    logger.info("notifications/broadcasts", "GET recipients", `broadcastId=${broadcastId} adminId=${session.user.id}`);
    const result = await providers.notification().getBroadcastRecipients(broadcastId);
    return Response.json(result);
  } catch (error) {
    return apiError("notifications/broadcasts", "GET recipients", error);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ broadcastId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) return unauthorized();
    const { broadcastId } = await ctx.params;
    logger.info("notifications/broadcasts", "DELETE", `broadcastId=${broadcastId} adminId=${session.user.id}`);
    const result = await providers.notification().deleteBroadcast(broadcastId);
    return Response.json(result);
  } catch (error) {
    return apiError("notifications/broadcasts", "DELETE", error);
  }
}