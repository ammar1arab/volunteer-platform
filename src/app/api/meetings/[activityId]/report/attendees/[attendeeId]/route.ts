import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ activityId: string; attendeeId: string }> }
) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    const { activityId, attendeeId } = await ctx.params;
    const body = (await req.json()) as { userId?: string | null };
    const userId = body.userId === undefined ? null : body.userId;

    logger.info("API", "PATCH /meetings/.../attendees", { activityId, attendeeId, userId });
    return toResponse(await providers.meeting().matchAttendee(activityId, attendeeId, userId));
  } catch (error) {
    return apiError("API", "PATCH /meetings/.../attendees", error);
  }
}
