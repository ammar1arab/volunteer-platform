import type { Gender, JordanianCity } from "@/core/domain/enums";
import type { Result } from "./base.dto";

export interface CityCount {
  city: JordanianCity;
  count: number;
}

export interface GenderCount {
  gender: Gender | null;
  count: number;
}

export interface DailySignup {
  date: string;
  count: number;
}

export interface DashboardStatsDto {
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
  topCities: CityCount[];
  genderSplit: GenderCount[];
  dailySignups: DailySignup[];
}

export type GetReportStatsResponse = Result<DashboardStatsDto>;
