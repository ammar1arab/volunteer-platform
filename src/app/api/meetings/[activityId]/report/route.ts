import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ activityId: string }> }) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    const { activityId } = await ctx.params;
    logger.info("API", "GET /meetings/[activityId]/report", activityId);
    return toResponse(await providers.meeting().getMeetingReport(activityId));
  } catch (error) {
    return apiError("API", "GET /meetings/[activityId]/report", error);
  }
}
