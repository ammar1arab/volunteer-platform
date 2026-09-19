import { ReportsRepository } from "@/infrastructure/persistence/repositories";
import { serviceError } from "@/core/application/common";
import { ok, type GetReportStatsResponse } from "@/core/application/dtos";
import { isGender, isJordanianCity, type JordanianCity } from "@/core/domain/enums";

const SIGNUP_DAYS = 30;

function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(daysAgo: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function buildDailySignups(createdAts: Date[]) {
  const counts = new Map<string, number>();
  for (const createdAt of createdAts) {
    const key = localDayKey(createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: { date: string; count: number }[] = [];
  const cursor = startOfLocalDay(SIGNUP_DAYS - 1);
  for (let i = 0; i < SIGNUP_DAYS; i += 1) {
    const key = localDayKey(cursor);
    series.push({ date: key, count: counts.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

class ReportsUseCase {
  private static readonly SCOPE = "ReportsUseCase";

  constructor(private reportsRepository: ReportsRepository) {}

  async getDashboardStats(): Promise<GetReportStatsResponse> {
    try {
      const monthStart = startOfLocalDay(0);
      monthStart.setDate(1);
      const raw = await this.reportsRepository.getDashboardStats(startOfLocalDay(SIGNUP_DAYS - 1), monthStart);

      return ok({
        totalUsers: raw.totalUsers,
        totalActivities: raw.totalActivities,
        pendingRequests: raw.pendingRequests,
        errorCount: raw.errorCount,
        activityViews: raw.activityViews,
        postViews: raw.postViews,
        magazineDownloads: raw.magazineDownloads,
        systemOperations: raw.systemOperations,
        newVolunteersThisMonth: raw.newVolunteersThisMonth,
        totalHours: raw.totalHours,
        certificatesCount: raw.certificatesCount,
        topCities: raw.cityGroups
          .filter((row): row is { city: JordanianCity; count: number } =>
            row.city !== null && isJordanianCity(row.city)
          )
          .map((row) => ({ city: row.city, count: row.count })),
        genderSplit: raw.genderGroups.map((row) => ({
          gender: row.gender && isGender(row.gender) ? row.gender : null,
          count: row.count
        })),
        dailySignups: buildDailySignups(raw.recentSignupAts)
      });
    } catch (error) {
      return serviceError(ReportsUseCase.SCOPE, "getDashboardStats", error, "Failed to fetch stats");
    }
  }
}

export default ReportsUseCase;
