"use client";

import { useState } from "react";
import styles from "./ReportsPage.module.scss";
import { useReportsPage } from "./ReportsPage.logic";
import { StatsCard, SelectInput, Search, SystemLogsTable, ConfirmDialog, SharedDataModal, Button } from "@/presentation/components";
import { MODAL_CONFIGS } from "./ReportsModalsConfig";
import { Activity, Users, Clock, ShieldAlert, Eye, FileText, Download, ActivitySquare, Trash2, ArrowRight } from "lucide-react";
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
    handlePageChange,
    filterAction,
    filterStatus,
    handleFilterChange,
    clearLogs,
    isClearing,
  } = useReportsPage();

  const [activeModal, setActiveModal] = useState<"users" | "activities" | "pending" | "errors" | "activityViews" | "postViews" | "magazineDownloads" | "operations" | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMobileTable, setShowMobileTable] = useState(false);

  const statItems = [
    { id: "users" as const, title: "إجمالي المستخدمين", value: stats?.totalUsers, icon: Users, variant: "primary" as const },
    { id: "activities" as const, title: "الأنشطة التطوعية", value: stats?.totalActivities, icon: Activity, variant: "success" as const },
    { id: "activityViews" as const, title: "مشاهدات الأنشطة", value: stats?.activityViews, icon: Eye, variant: "teal" as const },
    { id: "postViews" as const, title: "تفاعل المقالات", value: stats?.postViews, icon: FileText, variant: "warning" as const },
    { id: "magazineDownloads" as const, title: "تحميلات المجلة", value: stats?.magazineDownloads, icon: Download, variant: "violet" as const },
    { id: "operations" as const, title: "عمليات النظام", value: stats?.systemOperations, icon: ActivitySquare, variant: "pink" as const },
    { id: "pending" as const, title: "الطلبات المعلقة", value: stats?.pendingRequests, icon: Clock, variant: "orange" as const },
    { id: "errors" as const, title: "أخطاء النظام", value: stats?.errorCount, icon: ShieldAlert, variant: "danger" as const },
  ];

  if (showMobileTable) {
    return (
      <div className={styles.mobileTablePage}>
        <div className={styles.mobileHeader}>
          <button className={styles.back} onClick={() => setShowMobileTable(false)}>
            <ArrowRight size={16} /> العودة
          </button>
          <div className={styles.headerActions}>
            <h2>سجل أحداث النظام</h2>
          </div>
        </div>
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
          <Button 
            variant="danger"
            size="md"
            icon={<Trash2 size={16} />}
            onClick={() => setShowClearConfirm(true)}
            disabled={isClearing}
            loading={isClearing}
          >
            {isClearing ? "جاري المسح..." : "مسح السجلات"}
          </Button>
        </div>
        <SystemLogsTable
          logs={logs}
          isLoading={isLoadingLogs}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
        
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
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.mobileOnly}>
        <Button 
          variant="secondary" 
          fullWidth 
          icon={<Activity size={16} />} 
          onClick={() => setShowMobileTable(true)}
        >
          سجل أحداث النظام
        </Button>
      </div>

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

      <section className={`${styles.section} ${styles.desktopOnly}`}>
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
            <Button 
              variant="danger"
              size="md"
              icon={<Trash2 size={16} />}
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing}
              loading={isClearing}
            >
              {isClearing ? "جاري المسح..." : "مسح السجلات"}
            </Button>
          </div>
        </div>

        <SystemLogsTable
          logs={logs}
          isLoading={isLoadingLogs}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </section>

      {activeModal && MODAL_CONFIGS[activeModal] && (
        <SharedDataModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          {...MODAL_CONFIGS[activeModal]}
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
    </div>
  );
}
