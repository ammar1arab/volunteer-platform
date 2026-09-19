import { useState, useCallback } from "react";
import { useFetchData } from "@/presentation/hooks";
import type { DashboardStats } from "@/presentation/types/reports";

export const useAnalyticsStats = () => {
  const statsQuery = useFetchData<DashboardStats>({
    queryKey: ["reports", "stats"],
    request: async () => {
      const res = await fetch("/api/reports/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      return json.data;
    },
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    refetchStats: statsQuery.refetch,
  };
};
