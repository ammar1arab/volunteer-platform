import { z } from "zod";
import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 300;

const IssueCertificateBody = z.object({
  userId: z.string().trim().min(1, "معرّف المتطوع مطلوب")
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;

    const { id } = await ctx.params;
    const parsed = IssueCertificateBody.safeParse(await parseJson(req));
    if (!parsed.success) return badRequest("معرّف المتطوع مطلوب");

    logger.info("API", "POST /activities/[id]/certificates", `activityId=${id} userId=${parsed.data.userId}`);
    return toResponse(await providers.certificate().issueForVolunteer(id, parsed.data.userId));
  } catch (error) {
    return apiError("API", "POST /activities/[id]/certificates", error);
  }
}
