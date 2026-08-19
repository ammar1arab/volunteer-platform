import { useState, useCallback } from "react";
import { useFetchData } from "@/presentation/hooks";
import { SystemLogStatus } from "@/core/domain/enums";

export interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  pendingRequests: number;
  errorCount: number;
}

export interface SystemLog {
  id: string;
  action: string;
  status: SystemLogStatus;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { fullName: string; email: string } | null;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useReportsPage = () => {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const statsQuery = useFetchData<DashboardStats>({
    queryKey: ["reports", "stats"],
    request: async () => {
      const res = await fetch("/api/reports/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      return json.data;
    },
  });

  const logsQuery = useFetchData<{ logs: SystemLog[], pagination: PaginationData }>({
    queryKey: ["reports", "logs", page, filterAction, filterStatus],
    request: async () => {
      const res = await fetch(`/api/reports/logs?page=${page}&limit=15${filterAction ? `&action=${filterAction}` : ""}${filterStatus !== "ALL" ? `&status=${filterStatus}` : ""}`);
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

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    logs: logsQuery.data?.logs || [],
    pagination: logsQuery.data?.pagination,
    isLoadingLogs: logsQuery.isLoading,
    page,
    handlePageChange,
    filterAction,
    filterStatus,
    handleFilterChange,
  };
};
