import { UserRole } from "@/core/domain/enums";
import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /users", `admin=${auth.session.user.id}`);
    return toResponse(await providers.user().getAllWithAnalytics());
  } catch (error) {
    return apiError("API", "GET /users", error);
  }
}
