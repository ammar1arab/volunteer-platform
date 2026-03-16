import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.VOLUNTEER);
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /certificates", `userId=${auth.session.user.id}`);
    return toResponse(await providers.certificate().getByUser(auth.session.user.id));
  } catch (error) {
    return apiError("API", "GET /certificates", error);
  }
}