import { logger } from "@/lib/utils";
import { providers } from "@/lib/providers";
import { toResponse, requirePermission, apiError, badRequest } from "@/lib/api-utils";
import type { OnlineMeetingFilter } from "@/core/application/dtos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILTERS = new Set<OnlineMeetingFilter>(["upcoming", "finished", "all", "failed"]);

export async function GET(req: Request) {
  try {
    const auth = await requirePermission(req, "MANAGE_MEETINGS");
    if ("error" in auth) return auth.error;

    const url = new URL(req.url);
    const filterParam = (url.searchParams.get("filter") ?? "all") as OnlineMeetingFilter;
    if (!FILTERS.has(filterParam)) return badRequest("Invalid filter");

    logger.info("API", "GET /meetings", `filter=${filterParam}`);
    return toResponse(await providers.meeting().listOnlineMeetings(filterParam));
  } catch (error) {
    return apiError("API", "GET /meetings", error);
  }
}
