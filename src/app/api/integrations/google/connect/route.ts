import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    logger.info("API", "GET /integrations/google/connect", `userId=${auth.session.user.id}`);
    return toResponse(await providers.meeting().getConnectUrl(auth.session.user.id));
  } catch (error) {
    return apiError("API", "GET /integrations/google/connect", error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    logger.info("API", "POST /integrations/google/connect", `userId=${auth.session.user.id}`);
    return toResponse(await providers.meeting().getConnectUrl(auth.session.user.id));
  } catch (error) {
    return apiError("API", "POST /integrations/google/connect", error);
  }
}
