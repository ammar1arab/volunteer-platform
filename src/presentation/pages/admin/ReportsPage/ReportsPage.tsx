"use client";

import { useState } from "react";
import styles from "./ReportsPage.module.scss";
import { useReportsPage } from "./ReportsPage.logic";
import { SectionHeader, StatsCard, SelectInput, Search, SystemLogsTable, UsersAnalyticsModal, ActivitiesAnalyticsModal, PendingRequestsModal, SystemErrorsModal } from "@/presentation/components";
import { Activity, Users, Clock, ShieldAlert } from "lucide-react";
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

  const [activeModal, setActiveModal] = useState<"users" | "activities" | "pending" | "errors" | null>(null);

  const statItems = [
    { id: "users" as const, title: "إجمالي المستخدمين", value: stats?.totalUsers, icon: Users, color: "blue" as const },
    { id: "activities" as const, title: "الأنشطة التطوعية", value: stats?.totalActivities, icon: Activity, color: "green" as const },
    { id: "pending" as const, title: "الطلبات المعلقة", value: stats?.pendingRequests, icon: Clock, color: "yellow" as const },
    { id: "errors" as const, title: "أخطاء النظام", value: stats?.errorCount, icon: ShieldAlert, color: "red" as const },
  ];

  return (
    <div className={styles.page}>
      <SectionHeader title="سجل النظام والتقارير" subtitle="نظرة عامة على أداء المنصة وسجل النظام" align="start" />

      <div className={styles.statsGrid}>
        {statItems.map((item) => (
          <StatsCard
            key={item.id}
            title={item.title}
            value={item.value ?? "-"}
            icon={item.icon}
            color={item.color}
            loading={isLoadingStats}
            onClick={() => setActiveModal(item.id)}
          />
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>سجل أحداث النظام</h2>
          <div className={styles.filters}>
            <Search
              value={filterAction}
              onChange={(val) => handleFilterChange(val, filterStatus)}
              onSearch={(val) => handleFilterChange(val, filterStatus)}
              placeholder="ابحث في السجلات..."
            />
            <SelectInput
              label=""
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={(val) => handleFilterChange(filterAction, val)}
            />
          </div>
        </div>

        <SystemLogsTable
          logs={logs}
          isLoading={isLoadingLogs}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </section>

      <UsersAnalyticsModal isOpen={activeModal === "users"} onClose={() => setActiveModal(null)} />
      <ActivitiesAnalyticsModal isOpen={activeModal === "activities"} onClose={() => setActiveModal(null)} />
      <PendingRequestsModal 
        isOpen={activeModal === "pending"} 
        onClose={() => setActiveModal(null)}
        onApprove={() => {}}
        onReject={() => {}} 
      />
      <SystemErrorsModal isOpen={activeModal === "errors"} onClose={() => setActiveModal(null)} />
    </div>
  );
}
