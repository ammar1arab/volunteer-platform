import { formatNumber } from "@/lib/utils/text";
import { reportsApi } from "@/presentation/services";
import { queryKeys, unwrapResult, useFetchData } from "@/presentation/query";
import type { DashboardStats } from "@/presentation/types/reports";

const STATS_POLL_MS = 18_000;

export function formatCount(value: number | undefined): string {
  if (value == null) return "-";
  return formatNumber(Math.round(value));
}

export function formatHours(value: number | undefined): string {
  if (value == null) return "-";
  return formatNumber(value, { maximumFractionDigits: 1 });
}

export const useAnalyticsStats = () => {
  const statsQuery = useFetchData<DashboardStats>({
    queryKey: queryKeys.reports.stats(),
    request: async () => unwrapResult(await reportsApi.getStats()),
    options: {
      refetchInterval: STATS_POLL_MS,
      refetchIntervalInBackground: false,
      staleTime: 10_000,
    },
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    refetchStats: statsQuery.refetch,
  };
};
