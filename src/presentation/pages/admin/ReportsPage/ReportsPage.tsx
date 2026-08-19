"use client";

import styles from "./ReportsPage.module.scss";
import { useReportsPage } from "./ReportsPage.logic";
import { SectionHeader, StatsCard, Pagination, Badge, SelectInput, LoadingState } from "@/presentation/components";
import { Activity, Users, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { SystemLogStatus } from "@/core/domain/enums";

const STATUS_OPTIONS = [
  { value: "ALL", label: "كل الحالات" },
  { value: SystemLogStatus.SUCCESS, label: "نجاح" },
  { value: SystemLogStatus.ERROR, label: "خطأ" },
  { value: SystemLogStatus.FAILURE, label: "فشل" },
];

export default function ReportsPage() {
  const {
    stats,
    isLoadingStats,
    logs,
    pagination,
    isLoadingLogs,
    page,
    handlePageChange,
    filterAction,
    filterStatus,
    handleFilterChange,
  } = useReportsPage();

  const statItems = [
    { title: "إجمالي المستخدمين", value: stats?.totalUsers, icon: Users, color: "blue" as const },
    { title: "الأنشطة التطوعية", value: stats?.totalActivities, icon: Activity, color: "green" as const },
    { title: "الطلبات المعلقة", value: stats?.pendingRequests, icon: Clock, color: "yellow" as const },
    { title: "أخطاء النظام", value: stats?.errorCount, icon: ShieldAlert, color: "red" as const },
  ];

  return (
    <div className={styles.page}>
      <SectionHeader title="التقارير والإحصائيات" subtitle="نظرة عامة على أداء المنصة وسجل النظام" />

      <div className={styles.statsGrid}>
        {statItems.map((item, index) => (
          <StatsCard
            key={index}
            title={item.title}
            value={item.value ?? "-"}
            icon={item.icon}
            color={item.color}
            loading={isLoadingStats}
          />
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>سجل أحداث النظام</h2>
          <div className={styles.filters}>
            <SelectInput
              label="تصفية حسب الحالة"
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={(val) => handleFilterChange(filterAction, val)}
            />
          </div>
        </div>

        {isLoadingLogs ? (
          <LoadingState />
        ) : (
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
                        <Badge variant={log.status === SystemLogStatus.SUCCESS ? "success" : log.status === SystemLogStatus.ERROR ? "danger" : "warning"}>
                          {log.status === SystemLogStatus.SUCCESS ? "نجاح" : log.status === SystemLogStatus.ERROR ? "خطأ" : "فشل"}
                        </Badge>
                      </td>
                      <td dir="ltr" style={{ textAlign: "right" }}>
                        {new Date(log.createdAt).toLocaleString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                        لا توجد سجلات مطابقة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
