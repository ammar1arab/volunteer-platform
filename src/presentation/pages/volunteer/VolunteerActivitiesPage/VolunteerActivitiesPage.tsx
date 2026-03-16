"use client";
import styles from "./VolunteerActivitiesPage.module.scss";
import { useVolunteerActivitiesPage } from "./VolunteerActivitiesPage.logic";
import { ActivityStatus, ActivityType, AttendanceStatus, JordanianCity, MeetingPlatform, ParticipationStatus } from "@/core/domain/enums";
import {
  LoadingState, EmptyState, ToastContainer, Pagination,
  Search, ActivityItem, ConfirmDialog
} from "@/presentation/components";
import { CalendarDays } from "lucide-react";

const VolunteerActivitiesPage = () => {
  const {
    status, loading, stats,
    filtered, paginated, currentPage, setCurrentPage, itemsPerPage,
    activeFilter, setActiveFilter,
    searchQuery, setSearchQuery, setAppliedSearch, appliedSearch,
    actionLoading, reapply, cancelRequest,
    toasts, removeToast, confirmDialog,
  } = useVolunteerActivitiesPage();

  if (status === "loading" || loading) return <LoadingState />;

  const STAT_CARDS = [
    { key: ActivityStatus.COMPLETED, value: stats.completed, label: "مكتمل", cls: `${styles.statValue} ${styles.green}` },
    { key: ParticipationStatus.APPROVED, value: stats.approved, label: "موافق عليه", cls: `${styles.statValue} ${styles.green}` },
    { key: ParticipationStatus.PENDING, value: stats.pending, label: "قيد الانتظار", cls: styles.statValue },
    { key: ParticipationStatus.REJECTED, value: stats.rejected, label: "مرفوض", cls: `${styles.statValue} ${styles.red}` },
    { key: ParticipationStatus.CANCELLED, value: stats.cancelled, label: "ملغي", cls: `${styles.statValue} ${styles.muted}` },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className={styles.statsRow}>
          {STAT_CARDS.map(({ key, value, label, cls }) => (
            <div
              key={key}
              className={`${styles.statCard} ${activeFilter === key ? styles.active : ""}`}
              onClick={() => setActiveFilter(activeFilter === key ? "all" : key)}
            >
              <span className={cls}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.search}>
          <Search value={searchQuery} onChange={setSearchQuery} onSearch={setAppliedSearch} placeholder="ابحث عن فرصة..." />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={CalendarDays} message={appliedSearch ? "لا توجد نتائج" : "لم تنضم إلى أي فرصة بعد"} />
        ) : (
          <>
            <div className={styles.list}>
              {paginated.map(p => (
                <ActivityItem
                  key={p.id}
                  title={p.activity?.title ?? "فرصة تطوعية"}
                  description={p.activity?.description ?? ""}
                  date={p.activity?.date ?? ""}
                  startTime={p.activity?.startTime ?? ""}
                  endTime={p.activity?.endTime ?? ""}
                  placeName={p.activity?.placeName}
                  city={p.activity?.city as JordanianCity}
                  latitude={p.activity?.latitude}
                  longitude={p.activity?.longitude}
                  activityType={p.activity?.activityType as ActivityType}
                  meetingLink={p.activity?.meetingLink}
                  meetingPlatform={p.activity?.meetingPlatform as MeetingPlatform}
                  status={p.status as ParticipationStatus}
                  activityStatus={p.activity?.status}
                  requestedAt={p.requestedAt}
                  respondedAt={p.respondedAt}
                  volunteerHours={p.volunteerHours}
                  attendanceStatus={p.attendanceStatus as AttendanceStatus}
                  markedAt={p.markedAt}
                  actionLoading={actionLoading === p.activityId || actionLoading === p.id}
                  onReapply={
                    p.status === ParticipationStatus.REJECTED || p.status === ParticipationStatus.CANCELLED
                      ? () => reapply(p.activityId) : undefined
                  }
                  onCancel={
                    p.status === ParticipationStatus.PENDING || p.status === ParticipationStatus.APPROVED
                      ? () => cancelRequest(p.id)
                      : undefined
                  } />
              ))}
            </div>

            {filtered.length > itemsPerPage && (
              <Pagination currentPage={currentPage} totalItems={filtered.length}
                itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} sticky />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </div>
  );
};

export default VolunteerActivitiesPage;