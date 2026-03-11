import { UserRole } from "@/core/domain/enums";
import { providers } from "@/lib/providers";
import { toResponse, requireAuth, parseJson, badRequest, apiError } from "@/lib/api-utils";
import { logger } from "@/lib/utils";
import { BulkMarkAttendanceRequest } from "@/core/application/dtos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req, UserRole.ADMIN);
    if ("error" in auth) return auth.error;
    const body = await parseJson<BulkMarkAttendanceRequest>(req);
    if (!body?.items?.length) return badRequest("items مطلوبة");
    logger.info("API", "POST /activity-participations/bulk-mark-attendance", `count=${body.items.length}`);
    return toResponse(await providers.participation().bulkMarkAttendance(body));
  } catch (error) {
    return apiError("API", "POST /activity-participations/bulk-mark-attendance", error);
  }
}
