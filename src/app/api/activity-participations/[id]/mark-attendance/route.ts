import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";
import { MarkAttendanceRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;
    const { id } = await ctx.params;
    const body = await parseJson<{ attended: boolean }>(req);
    if (!body) return badRequest("Invalid JSON body");
    const dto: MarkAttendanceRequest = {
      participationId: id,
      attended: body.attended,
    };
    logger.info("API", "POST /activity-participations/[id]/mark-attendance", `admin=${auth.session.user.id} request=${id}`);
    return toResponse(await providers.participation().markAttendance(dto));
  } catch (error) {
    return apiError("API", "POST /activity-participations/[id]/mark-attendance", error);
  }
}