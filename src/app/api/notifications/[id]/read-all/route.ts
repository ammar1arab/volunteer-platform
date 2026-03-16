import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.VOLUNTEER);
    if ("error" in auth) return auth.error;

    logger.info("API", "PATCH /notifications/read-all", `userId=${auth.session.user.id}`);
    return toResponse(await providers.notification().markAllAsRead(auth.session.user.id));
  } catch (error) {
    return apiError("API", "PATCH /notifications/read-all", error);
  }
}