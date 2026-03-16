import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const auth = await requireAuth(req, UserRole.VOLUNTEER);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "PATCH /notifications/[id]/read", `userId=${auth.session.user.id} id=${id}`);
    return toResponse(await providers.notification().markAsRead(id, auth.session.user.id));
  } catch (error) {
    return apiError("API", "PATCH /notifications/[id]/read", error);
  }
}