import { ShieldAlert, ActivitySquare } from "lucide-react";
import { SystemLogBadge } from "@/presentation/components";
import { formatDate } from "@/lib/utils/date";
import type { Column, SharedDataModalConfig } from "@/presentation/components/admin/SharedDataModal/SharedDataModal";
import type { SystemLog } from "@/presentation/types/reports";

export const SYSTEM_LOGS_COLUMNS: Column<SystemLog>[] = [
  { key: "action", header: "الحدث", accessor: (l) => l.action, sortable: true, sortValue: (l) => l.action },
  { key: "user", header: "المستخدم", accessor: (l) => l.user?.fullName || "نظام", sortable: true, sortValue: (l) => l.user?.fullName || "نظام" },
  { key: "status", header: "الحالة", accessor: (l) => <SystemLogBadge status={l.status} /> },
  { key: "date", header: "التاريخ", accessor: (l) => formatDate(l.createdAt), sortable: true, sortValue: (l) => new Date(l.createdAt).getTime() },
];

export type LogsModalId = "errors" | "operations";

export const LOGS_MODAL_CONFIGS: Record<LogsModalId, SharedDataModalConfig<SystemLog>> = {
  errors: {
    title: "أخطاء النظام",
    icon: ShieldAlert,
    fetchUrl: "/api/reports/logs?limit=50&status=ERROR",
    dataKey: "logs",
    columns: SYSTEM_LOGS_COLUMNS,
    emptyTitle: "لا توجد أخطاء",
    emptyMessage: "النظام يعمل بكفاءة ولا توجد أخطاء مسجلة حالياً.",
  },
  operations: {
    title: "عمليات النظام",
    icon: ActivitySquare,
    fetchUrl: "/api/reports/logs?limit=50",
    dataKey: "logs",
    columns: SYSTEM_LOGS_COLUMNS,
    emptyTitle: "لا يوجد عمليات",
    emptyMessage: "لا توجد عمليات مسجلة في النظام.",
  },
};
