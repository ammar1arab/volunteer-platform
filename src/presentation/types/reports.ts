import type { Prisma } from "@prisma/client";
import type { SystemLogStatus } from "@/core/domain/enums";

export interface DashboardStats {
  totalUsers: number;
  totalActivities: number;
  pendingRequests: number;
  errorCount: number;
  activityViews: number;
  postViews: number;
  magazineDownloads: number;
  systemOperations: number;
}

export interface SystemLog {
  id: string;
  action: string;
  status: SystemLogStatus;
  message: string | null;
  metadata: Prisma.JsonValue;
  createdAt: string;
  user: { fullName: string; email: string } | null;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
