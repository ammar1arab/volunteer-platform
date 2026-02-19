import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, forbidden, apiError } from "@/lib/api-utils";
import { UserRole } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    if (
      auth.session.user.role !== UserRole.ADMIN &&
      auth.session.user.id !== id
    ) {
      return forbidden();
    }

    logger.info(
      "API",
      "GET /users/[id]",
      `requester=${auth.session.user.id} target=${id}`,
    );
    return toResponse(await providers.user().getUserDetails(id));
  } catch (error) {
    return apiError("API", "GET /users/[id]", error);
  }
}
