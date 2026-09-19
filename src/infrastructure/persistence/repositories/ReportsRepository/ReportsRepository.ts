import { prisma } from "@/infrastructure/persistence/prisma";
import { CertificateStatus, UserRole } from "@/core/domain/enums";

export interface DashboardStatsQuery {
  totalUsers: number;
  totalActivities: number;
  pendingRequests: number;
  errorCount: number;
  activityViews: number;
  postViews: number;
  magazineDownloads: number;
  systemOperations: number;
  newVolunteersThisMonth: number;
  totalHours: number;
  certificatesCount: number;
  cityGroups: { city: string | null; count: number }[];
  genderGroups: { gender: string | null; count: number }[];
  recentSignupAts: Date[];
}

export default class ReportsRepository {
  async getDashboardStats(signupStart: Date, monthStart: Date): Promise<DashboardStatsQuery> {
    const [
      totalUsers,
      totalActivities,
      pendingRequests,
      systemLogsStats,
      activityViewsAgg,
      postViewsAgg,
      magazineDownloadsAgg,
      systemOperations,
      newVolunteersThisMonth,
      hoursAgg,
      certificatesCount,
      cityGroups,
      genderGroups,
      recentSignups
    ] = await Promise.all([
      prisma.user.count(),
      prisma.activity.count({ where: { deletedAt: null } }),
      prisma.activityParticipation.count({ where: { status: "PENDING" } }),
      prisma.systemLog.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.activity.aggregate({ where: { deletedAt: null }, _sum: { views: true } }),
      prisma.featuredPost.aggregate({ _sum: { views: true } }),
      prisma.monthlyMagazine.aggregate({ _sum: { downloads: true } }),
      prisma.systemLog.count(),
      prisma.user.count({
        where: { role: UserRole.VOLUNTEER, createdAt: { gte: monthStart } }
      }),
      prisma.volunteerProfile.aggregate({ _sum: { totalVolunteerHours: true } }),
      prisma.certificate.count({
        where: { isActive: true, status: CertificateStatus.COMPLETED }
      }),
      prisma.volunteerProfile.groupBy({
        by: ["city"],
        _count: { _all: true },
        orderBy: { _count: { city: "desc" } },
        take: 5
      }),
      prisma.volunteerProfile.groupBy({
        by: ["gender"],
        _count: { _all: true }
      }),
      prisma.user.findMany({
        where: { role: UserRole.VOLUNTEER, createdAt: { gte: signupStart } },
        select: { createdAt: true }
      })
    ]);

    return {
      totalUsers,
      totalActivities,
      pendingRequests,
      errorCount: systemLogsStats
        .filter((row) => row.status === "ERROR" || row.status === "FAILURE")
        .reduce((sum, row) => sum + row._count.status, 0),
      activityViews: activityViewsAgg._sum.views ?? 0,
      postViews: postViewsAgg._sum.views ?? 0,
      magazineDownloads: magazineDownloadsAgg._sum.downloads ?? 0,
      systemOperations,
      newVolunteersThisMonth,
      totalHours: hoursAgg._sum.totalVolunteerHours ?? 0,
      certificatesCount,
      cityGroups: cityGroups.map((row) => ({ city: row.city, count: row._count._all })),
      genderGroups: genderGroups.map((row) => ({ gender: row.gender, count: row._count._all })),
      recentSignupAts: recentSignups.map((row) => row.createdAt)
    };
  }
}
