import { providers } from "@/lib/providers";
import { toResponse, requireAuth, forbidden, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req : Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    if (auth.session.user.role !== "ADMIN" && auth.session.user.id !== id) {
      return forbidden();
    }

    logger.info("API", "GET /users/[id]/activities", `requester=${auth.session.user.id} target=${id}`);
    return toResponse(await providers.user().getUserActivities(id));
  } catch (error) {
    return apiError("API", "GET /users/[id]/activities", error);
  }
}
