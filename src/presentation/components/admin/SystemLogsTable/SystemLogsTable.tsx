import React from "react";
import styles from "./SystemLogsTable.module.scss";
import { Badge, Pagination, EmptyState, LoadingState } from "@/presentation/components";
import { formatDateArabic } from "@/lib/utils";
import { SystemLogStatus } from "@/core/domain/enums";
import { Activity } from "lucide-react";
import type { SystemLog, PaginationData } from "@/presentation/pages/admin/ReportsPage/ReportsPage.logic";

interface Props {
  logs: SystemLog[];
  isLoading: boolean;
  pagination?: PaginationData;
  onPageChange: (page: number) => void;
}

const SystemLogsTable: React.FC<Props> = ({ logs, isLoading, pagination, onPageChange }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="لا توجد سجلات"
        message="لم يتم العثور على أية أحداث نظام مطابقة لمعايير التصفية الخاصة بك."
      />
    );
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الحدث</th>
              <th>المستخدم</th>
              <th>الحالة</th>
              <th>التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  <div className={styles.actionCell}>
                    <span className={styles.actionName}>{log.action}</span>
                    {log.message && <span className={styles.actionMessage}>{log.message}</span>}
                  </div>
                </td>
                <td>
                  {log.user ? (
                    <div className={styles.userCell}>
                      <span className={styles.userName}>{log.user.fullName}</span>
                      <span className={styles.userEmail}>{log.user.email}</span>
                    </div>
                  ) : (
                    <span className={styles.userEmail}>نظام</span>
                  )}
                </td>
                <td>
                  <Badge
                    variant={
                      log.status === SystemLogStatus.SUCCESS
                        ? "success"
                        : log.status === SystemLogStatus.ERROR
                        ? "danger"
                        : "warning"
                    }
                  >
                    {log.status === SystemLogStatus.SUCCESS
                      ? "نجاح"
                      : log.status === SystemLogStatus.ERROR
                      ? "خطأ"
                      : "فشل"}
                  </Badge>
                </td>
                <td dir="ltr" style={{ textAlign: "right" }}>
                  {formatDateArabic(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default SystemLogsTable;
