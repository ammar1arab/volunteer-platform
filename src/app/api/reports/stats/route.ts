import { requireAnyPermission, toResponse, apiError } from "@/lib/api-utils";
import { providers } from "@/lib/providers";

export async function GET(req: Request) {
  try {
    const auth = await requireAnyPermission(req, ["MANAGE_REPORTS", "MANAGE_LOGS"]);
    if ("error" in auth) return auth.error;
    return toResponse(await providers.reports().getDashboardStats());
  } catch (error) {
    return apiError("API", "GET /reports/stats", error);
  }
}
