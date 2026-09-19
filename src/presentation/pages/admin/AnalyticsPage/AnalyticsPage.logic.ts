import { Activity, Award, Clock3, Gauge, Timer, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils/text";
import { reportsApi } from "@/presentation/services";
import { queryKeys, unwrapResult, useFetchData } from "@/presentation/query";
import type { DashboardStats, PulseMetric, ReportRange } from "@/presentation/types/reports";
import { COPY } from "./AnalyticsCopy";

export function formatCount(value: number | undefined): string {
  if (value == null) return "-";
  return formatNumber(Math.round(value));
}

export function formatHours(value: number | undefined): string {
  if (value == null) return "-";
  return formatNumber(value, { maximumFractionDigits: 1 });
}

export const useAnalyticsStats = (range: ReportRange) => {
  const statsQuery = useFetchData<DashboardStats>({
    queryKey: queryKeys.reports.stats(range),
    request: async () => unwrapResult(await reportsApi.getStats(range)),
    options: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true
    }
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    isRefreshing: statsQuery.isFetching && !!statsQuery.data,
    statsError: statsQuery.error,
    refetchStats: statsQuery.refetch
  };
};

export type PulseItem = {
  label: string;
  icon: LucideIcon;
  metric?: PulseMetric;
  format?: "hours" | "percent";
  values: number[];
};

function series(metric?: PulseMetric, daily?: number[]) {
  if (daily && daily.length > 1) return daily;
  if (!metric) return [];
  return [metric.previous ?? metric.current, metric.current];
}

export function buildPulse(stats?: DashboardStats): PulseItem[] {
  return [
    { label: COPY.pulse.volunteers, icon: UserPlus, metric: stats?.pulse.volunteers, values: series(stats?.pulse.volunteers, stats?.dailyPulse.map((row) => row.volunteers)) },
    { label: COPY.pulse.activities, icon: Activity, metric: stats?.pulse.activities, values: series(stats?.pulse.activities) },
    { label: COPY.pulse.requests, icon: Clock3, metric: stats?.pulse.requests, values: series(stats?.pulse.requests, stats?.dailyPulse.map((row) => row.requests)) },
    { label: COPY.pulse.hours, icon: Timer, metric: stats?.pulse.hours, format: "hours", values: series(stats?.pulse.hours) },
    { label: COPY.pulse.certificates, icon: Award, metric: stats?.pulse.certificates, values: series(stats?.pulse.certificates) },
    { label: COPY.pulse.attendance, icon: Gauge, metric: stats?.pulse.attendanceRate, format: "percent", values: series(stats?.pulse.attendanceRate) }
  ];
}

export function buildTotals(stats?: DashboardStats) {
  return [
    { label: COPY.totals.volunteers, value: formatCount(stats?.lifetime?.users) },
    { label: COPY.totals.activities, value: formatCount(stats?.lifetime?.activities) },
    { label: COPY.totals.pending, value: formatCount(stats?.lifetime?.pendingRequests) },
    { label: COPY.totals.hours, value: formatHours(stats?.lifetime?.hours) },
    { label: COPY.totals.certificates, value: formatCount(stats?.lifetime?.certificates) },
    { label: COPY.totals.thisMonth, value: formatCount(stats?.lifetime?.newVolunteersThisMonth) }
  ];
}

export function formatPulseValue(item: PulseItem) {
  if (!item.metric) return "-";
  if (item.format === "hours") return formatHours(item.metric.current);
  if (item.format === "percent") return `${formatNumber(item.metric.current, { maximumFractionDigits: 1 })}%`;
  return formatCount(item.metric.current);
}

export function heroSummary(stats: DashboardStats | undefined, range: ReportRange) {
  if (!stats) return COPY.loadingHint;
  const period = range === "all" ? "كامل الفترة" : `آخر ${range.replace("d", "")} يوماً`;
  return `خلال ${period}، انضم ${formatCount(stats.pulse.volunteers.current)} متطوعاً وسُجلت ${formatHours(stats.pulse.hours.current)} ساعة تطوعية.`;
}
