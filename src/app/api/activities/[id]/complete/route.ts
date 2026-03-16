import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";
import { inngest } from "@/lib/inngest/client";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    logger.info("API", "POST /activities/[id]/complete", id);

    const result = await providers.activity().complete(id);
    if (!result.success) return toResponse(result);

    await inngest.send({ name: "activity/completed", data: { activityId: id } });
    logger.info("API", "POST /activities/[id]/complete", `Inngest event sent for: ${id}`);

    return toResponse(result);
  } catch (error) {
    return apiError("API", "POST /activities/[id]/complete", error);
  }
}
