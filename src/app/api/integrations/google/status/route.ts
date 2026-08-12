import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /integrations/google/status", `userId=${auth.session.user.id}`);
    return toResponse(await providers.meeting().getIntegrationStatus());
  } catch (error) {
    return apiError("API", "GET /integrations/google/status", error);
  }
}
