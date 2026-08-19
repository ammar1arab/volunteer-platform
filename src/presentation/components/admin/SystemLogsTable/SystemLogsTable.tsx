import React from "react";
import styles from "./SystemLogsTable.module.scss";
import { Pagination, EmptyState, LoadingState, SystemLogBadge } from "@/presentation/components";
import { formatDate } from "@/lib/utils/date";
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
                <td data-label="الحدث">
                  <div className={styles.actionCell}>
                    <span className={styles.actionName}>{log.action}</span>
                    {log.message && <span className={styles.actionMessage}>{log.message}</span>}
                  </div>
                </td>
                <td data-label="المستخدم">
                  {log.user ? (
                    <div className={styles.userCell}>
                      <span className={styles.userName}>{log.user.fullName}</span>
                      <span className={styles.userEmail}>{log.user.email}</span>
                    </div>
                  ) : (
                    <span className={styles.userEmail}>نظام</span>
                  )}
                </td>
                <td data-label="الحالة">
                  <SystemLogBadge status={log.status} />
                </td>
                <td data-label="التاريخ والوقت" dir="ltr" className={styles.dateCell}>
                  {formatDate(log.createdAt)}
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
