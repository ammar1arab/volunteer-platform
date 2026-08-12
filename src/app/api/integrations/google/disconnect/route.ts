import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    logger.info("API", "POST /integrations/google/disconnect", `userId=${auth.session.user.id}`);
    return toResponse(await providers.meeting().disconnect());
  } catch (error) {
    return apiError("API", "POST /integrations/google/disconnect", error);
  }
}
