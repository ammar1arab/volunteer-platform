import { useState, useCallback } from "react";
import { useFetchData } from "@/presentation/hooks";
import type { SystemLog, PaginationData, DashboardStats } from "@/presentation/types/reports";

export const useSystemLogs = () => {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isClearing, setIsClearing] = useState(false);

  const statsQuery = useFetchData<Pick<DashboardStats, "errorCount" | "systemOperations">>({
    queryKey: ["reports", "stats"],
    request: async () => {
      const res = await fetch("/api/reports/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      return {
        errorCount: json.data.errorCount,
        systemOperations: json.data.systemOperations,
      };
    },
  });

  const logsQuery = useFetchData<{ logs: SystemLog[]; pagination: PaginationData }>({
    queryKey: ["reports", "logs", page, filterAction, filterStatus],
    request: async () => {
      const res = await fetch(
        `/api/reports/logs?page=${page}&limit=20${filterAction ? `&action=${filterAction}` : ""}${filterStatus !== "ALL" ? `&status=${filterStatus}` : ""}`
      );
      if (!res.ok) throw new Error("Failed to fetch logs");
      const json = await res.json();
      return { logs: json.data, pagination: json.pagination };
    },
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleFilterChange = useCallback((action: string, status: string) => {
    setFilterAction(action);
    setFilterStatus(status);
    setPage(1);
  }, []);

  const clearLogs = useCallback(async () => {
    try {
      setIsClearing(true);
      const res = await fetch("/api/reports/logs", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear logs");
      void statsQuery.refetch();
      void logsQuery.refetch();
      setPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  }, [statsQuery, logsQuery]);

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
    clearLogs,
    isClearing,
  };
};
