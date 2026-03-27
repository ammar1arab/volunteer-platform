import * as Sentry from "@sentry/nextjs";
import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.VOLUNTEER);
    if ("error" in auth) return auth.error;

    const body = await parseJson<{ activityId: string }>(req);
    if (!body?.activityId?.trim()) return badRequest("Activity ID is required");

    logger.info("API", "POST /activity-participations", `user=${auth.session.user.id} activity=${body.activityId}`);
    return toResponse(
      await providers.participation().createJoinRequest(body.activityId, auth.session.user.id),
      201,
    );
  } catch (error) {
    return apiError("API", "POST /activity-participations", error);
  }
}
