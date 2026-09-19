import type { Prisma } from "@prisma/client";
import type { SystemLogStatus } from "@/core/domain/enums";

export type {
  CityCount,
  GenderCount,
  DailySignup,
  DashboardStatsDto as DashboardStats
} from "@/core/application/dtos";

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
