import { requireAnyPermission, toResponse, apiError } from "@/lib/api-utils";
import { providers } from "@/lib/providers";
import type { ReportRange } from "@/core/application/dtos";

const ranges: ReportRange[] = ["7d", "30d", "90d", "all"];

export async function GET(req: Request) {
  try {
    const auth = await requireAnyPermission(req, ["MANAGE_REPORTS", "MANAGE_LOGS"]);
    if ("error" in auth) return auth.error;
    const value = new URL(req.url).searchParams.get("range") ?? "30d";
    const range = ranges.find((item) => item === value) ?? "30d";
    return toResponse(await providers.reports().getDashboardStats(range));
  } catch (error) {
    return apiError("API", "GET /reports/stats", error);
  }
}
