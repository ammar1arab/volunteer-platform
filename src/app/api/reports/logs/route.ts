import { NextRequest, NextResponse } from "next/server";
import { requirePermission, toResponse, apiError } from "@/lib/api-utils";
import { providers } from "@/lib/providers";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, "MANAGE_LOGS");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const action = searchParams.get("action") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await providers.systemLog().getLogs(page, limit, { action, status });
    if (!result.success) return toResponse(result);

    return NextResponse.json({
      success: true,
      data: result.data.logs,
      pagination: result.data.pagination
    });
  } catch (error) {
    return apiError("API", "GET /reports/logs", error);
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requirePermission(req, "MANAGE_LOGS");
    if ("error" in auth) return auth.error;

    const result = await providers.systemLog().clearAll();
    if (!result.success) return toResponse(result);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError("API", "DELETE /reports/logs", error);
  }
}
