import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/prisma";
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

    const [
      totalUsers,
      totalActivities,
      pendingRequests,
      systemLogsStats,
      activityViewsAgg,
      postViewsAgg,
      magazineDownloadsAgg,
      systemOperations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.activity.count(),
      prisma.activityParticipation.count({ where: { status: "PENDING" } }),
      prisma.systemLog.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.activity.aggregate({ _sum: { views: true } }),
      prisma.featuredPost.aggregate({ _sum: { views: true } }),
      prisma.monthlyMagazine.aggregate({ _sum: { downloads: true } }),
      prisma.systemLog.count(),
    ]);

    const errorCount = systemLogsStats
      .filter((s: { status: string; _count: { status: number } }) => s.status === "ERROR" || s.status === "FAILURE")
      .reduce((acc: number, curr: { status: string; _count: { status: number } }) => acc + curr._count.status, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalActivities,
        pendingRequests,
        errorCount,
        activityViews: activityViewsAgg._sum.views ?? 0,
        postViews: postViewsAgg._sum.views ?? 0,
        magazineDownloads: magazineDownloadsAgg._sum.downloads ?? 0,
        systemOperations,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

