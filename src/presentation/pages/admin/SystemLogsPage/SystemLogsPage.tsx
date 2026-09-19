"use client";

import { useState } from "react";
import styles from "./SystemLogsPage.module.scss";
import { useSystemLogs } from "./SystemLogsPage.logic";
import {
  StatsCard,
  SystemLogsTable,
  SystemLogsFilters,
  ConfirmDialog,
  SharedDataModal,
  Container,
} from "@/presentation/components";
import { LOGS_MODAL_CONFIGS, type LogsModalId } from "./SystemLogsModalsConfig";
import { ShieldAlert, ActivitySquare } from "lucide-react";

export default function SystemLogsPage() {
  const {
    stats,
    isLoadingStats,
    logs,
    pagination,
    isLoadingLogs,
    handlePageChange,
    filterAction,
    filterStatus,
    handleFilterChange,
    clearLogs,
    isClearing,
  } = useSystemLogs();

  const [activeModal, setActiveModal] = useState<LogsModalId | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const statItems = [
    { id: "operations" as const, title: "عمليات النظام", value: stats?.systemOperations, icon: ActivitySquare, variant: "pink" as const },
    { id: "errors" as const, title: "أخطاء النظام", value: stats?.errorCount, icon: ShieldAlert, variant: "danger" as const },
  ];

  return (
    <Container flush className={styles.page}>
      <div className={styles.statsGrid}>
        {statItems.map((item) => (
          <StatsCard
            key={item.id}
            title={item.title}
            value={item.value ?? "-"}
            icon={item.icon}
            variant={item.variant}
            loading={isLoadingStats}
            onClick={() => setActiveModal(item.id)}
          />
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>سجل أحداث النظام</h2>
          <SystemLogsFilters
            filterAction={filterAction}
            filterStatus={filterStatus}
            onFilterChange={handleFilterChange}
            onClearRequest={() => setShowClearConfirm(true)}
            isClearing={isClearing}
          />
        </div>

        <SystemLogsTable
          logs={logs}
          isLoading={isLoadingLogs}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </section>

      {activeModal && (
        <SharedDataModal
          key={activeModal}
          isOpen
          onClose={() => setActiveModal(null)}
          {...LOGS_MODAL_CONFIGS[activeModal]}
        />
      )}

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearLogs();
          setShowClearConfirm(false);
        }}
        title="تأكيد مسح السجلات"
        message="هل أنت متأكد من رغبتك في مسح جميع سجلات النظام؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، امسح السجلات"
        cancelText="إلغاء"
        variant="danger"
      />
    </Container>
  );
}
