import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.VOLUNTEER);
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /activity-participations/my-requests", `volunteer=${auth.session.user.id}`);
    return toResponse(await providers.participation().getByVolunteer(auth.session.user.id));
  } catch (error) {
    return apiError("API", "GET /activity-participations/my-requests", error);
  }
}
