import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /activity-participations/pending", `admin=${auth.session.user.id}`);
    return toResponse(await providers.participation().getAllPending());
  } catch (error) {
    return apiError("API", "GET /activity-participations/pending", error);
  }
}
