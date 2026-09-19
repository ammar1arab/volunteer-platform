import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type { GetReportStatsResponse, Result } from "@/core/application/dtos";
import type { PaginationData, SystemLog } from "@/presentation/types/reports";
import type { ReportRange } from "@/core/application/dtos";

export type GetSystemLogsResponse = Result<SystemLog[]> & { pagination: PaginationData };
export type ClearSystemLogsResponse = { success: true };

export const reportsApi = {
  getStats: (range: ReportRange = "30d") => apiClient.get<GetReportStatsResponse>(`${API_ENDPOINTS.REPORTS.STATS}?range=${range}`),
  getLogs: (page: number, limit: number, action: string, status: string) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (action) query.set("action", action);
    if (status !== "ALL") query.set("status", status);
    return apiClient.get<GetSystemLogsResponse>(`${API_ENDPOINTS.REPORTS.LOGS}?${query}`);
  },
  clearLogs: () => apiClient.delete<ClearSystemLogsResponse>(API_ENDPOINTS.REPORTS.LOGS)
};
