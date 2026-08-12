import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ activityId: string }> }) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const { activityId } = await ctx.params;
    logger.info(
      "API",
      "GET /meetings/[activityId]/launch",
      `activityId=${activityId} userId=${auth.session.user.id}`
    );
    return toResponse(
      await providers
        .meeting()
        .getMeetingLaunchUrl(activityId, auth.session.user.id, auth.session.user.role)
    );
  } catch (error) {
    return apiError("API", "GET /meetings/[activityId]/launch", error);
  }
}
