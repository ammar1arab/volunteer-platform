import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "POST /activity-participations/[id]/reject", `admin=${auth.session.user.id} request=${id}`);
    return toResponse(await providers.participation().reject(id));
  } catch (error) {
    return apiError("API", "POST /activity-participations/[id]/reject", error);
  }
}
