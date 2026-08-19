import { NextRequest, NextResponse } from "next/server";
import { providers } from "@/lib/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import type { AdminPermission } from "@/core/domain/enums";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const hasPermission = session.user.isSuperAdmin || session.user.permissions?.includes("MANAGE_REPORTS" as AdminPermission);
    if (!isAdmin || !hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const action = searchParams.get("action") || undefined;
    const status = searchParams.get("status") || undefined;

    const result = await providers.systemLog().getLogs(page, limit, { action, status });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data.logs,
      pagination: result.data.pagination
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const hasPermission = session.user.isSuperAdmin || session.user.permissions?.includes("MANAGE_REPORTS" as AdminPermission);
    if (!isAdmin || !hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await providers.systemLog().clearAll();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
