import { UserRole } from "@/core/domain/enums";
import { logger } from "@/core/application/helpers";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "GET /activities/[id]/volunteers", id);
    return toResponse(await providers.activity().getVolunteers(id));
  } catch (error) {
    return apiError("API", "GET /activities/[id]/volunteers", error);
  }
}
