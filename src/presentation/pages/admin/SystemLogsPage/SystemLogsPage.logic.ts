import { useState, useCallback } from "react";
import { reportsApi } from "@/presentation/services";
import { queryKeys, unwrapResult, useApiMutation, useFetchData } from "@/presentation/query";
import type { DashboardStats, PaginationData, SystemLog } from "@/presentation/types/reports";

export const useSystemLogs = () => {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const statsQuery = useFetchData<DashboardStats>({
    queryKey: queryKeys.reports.stats("all"),
    request: async () => unwrapResult(await reportsApi.getStats("all"))
  });

  const logsQuery = useFetchData<{ logs: SystemLog[]; pagination: PaginationData }>({
    queryKey: queryKeys.reports.logs(page, filterAction, filterStatus),
    request: async () => {
      const res = await reportsApi.getLogs(page, 20, filterAction, filterStatus);
      return { logs: unwrapResult(res), pagination: res.pagination };
    }
  });

  const clearMutation = useApiMutation<void, void>({
    request: async () => {
      await reportsApi.clearLogs();
    },
    invalidateQueries: queryKeys.reports.all,
    onSuccess: () => setPage(1)
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleFilterChange = useCallback((action: string, status: string) => {
    setFilterAction(action);
    setFilterStatus(status);
    setPage(1);
  }, []);

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    logs: logsQuery.data?.logs || [],
    pagination: logsQuery.data?.pagination,
    isLoadingLogs: logsQuery.isLoading,
    handlePageChange,
    filterAction,
    filterStatus,
    handleFilterChange,
    clearLogs: () => clearMutation.mutate(),
    isClearing: clearMutation.isPending
  };
};
