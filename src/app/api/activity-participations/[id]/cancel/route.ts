import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.VOLUNTEER);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "POST /activity-participations/[id]/cancel", `volunteer=${auth.session.user.id} request=${id}`);
    return toResponse(await providers.participation().cancelRequest(id, auth.session.user.id));
  } catch (error) {
    return apiError("API", "POST /activity-participations/[id]/cancel", error);
  }
}