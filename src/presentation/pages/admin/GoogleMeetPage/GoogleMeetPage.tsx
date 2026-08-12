"use client";

import styles from "./GoogleMeetPage.module.scss";
import { useGoogleMeetPage, TABS } from "./GoogleMeetPage.logic";
import {
  LoadingState,
  EmptyState,
  ToastContainer,
  ConfirmDialog,
  Search,
  Pagination,
  StatsCard,
  Button,
  MeetingStatusBadge,
  Dropdown,
  MeetingReportModal,
  VolunteersModal
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { getMeetingLinkSourceLabel } from "@/presentation/constants/labels";
import { MeetingSyncStatus, ActivityType, ActivityStatus } from "@/core/domain/enums";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  ExternalLink,
  RotateCcw,
  Link2,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PlugZap,
  Unplug,
  Download,
  FileText,
  Users
} from "lucide-react";

const formatDate = (date: string, startTime: string, endTime: string) => {
  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString("ar-JO", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    return `${datePart} · ${startTime} – ${endTime}`;
  } catch {
    return `${date} · ${startTime} – ${endTime}`;
  }
};

const GoogleMeetPage = () => {
  const router = useRouter();
  const {
    status,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    syncFilter,
    setSyncFilter,
    syncFilterItems,
    filtered,
    paginated,
    stats,
    meetingsLoading,
    integrationLoading,
    submitting,
    integration,
    organizerEmail,
    failedMeetings,
    toasts,
    removeToast,
    handleConnect,
    handleDisconnect,
    handleRetry,
    handleImportReport,
    handleLaunch,
    openReport,
    openVolunteers,
    reportMeeting,
    setReportMeeting,
    matchOptions,
    volunteersMeeting,
    setVolunteersMeeting,
    refreshMeetings,
    confirmDialog
  } = useGoogleMeetPage();

  if (status === "loading") return <LoadingState />;

  const showList = activeTab === "upcoming" || activeTab === "finished";
  const loadingList = showList && meetingsLoading;
  const loadingSettings = activeTab === "settings" && (integrationLoading || meetingsLoading);

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div className={styles.tabs} role="tablist" aria-label="أقسام إدارة الاجتماعات">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {showList && (
        <>
          <div className={styles.statsRow}>
            <StatsCard icon={CalendarDays} value={stats.total} label="الاجتماعات" variant="blue" />
            <StatsCard icon={CheckCircle2} value={stats.synced} label="مزامنة ناجحة" variant="green" />
            <StatsCard icon={Clock3} value={stats.pending} label="قيد المزامنة" variant="yellow" />
            <StatsCard icon={AlertTriangle} value={stats.failed} label="فشل المزامنة" variant="red" />
          </div>

          <div className={styles.actions}>
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setAppliedSearch}
              placeholder="ابحث بالعنوان أو المقدم..."
            />
            <div className={styles.actionsEnd}>
              <Dropdown
                items={syncFilterItems}
                active={syncFilter}
                onChange={setSyncFilter}
                placeholder="حالة المزامنة"
                compact
              />
            </div>
          </div>

          {loadingList ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Video}
              message={
                appliedSearch || syncFilter !== "ALL"
                  ? "لا توجد نتائج للبحث"
                  : activeTab === "upcoming"
                    ? "لا توجد اجتماعات قادمة"
                    : "لا توجد اجتماعات منتهية"
              }
              action={
                !appliedSearch && syncFilter === "ALL"
                  ? {
                      label: "إدارة الفرص",
                      onClick: () => router.push(ROUTES.ADMIN.ACTIVITIES)
                    }
                  : undefined
              }
            />
          ) : (
            <>
              <div className={styles.list}>
                {paginated.map((meeting) => (
                  <article key={meeting.activityId} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardMeta}>
                        <h3 className={styles.cardTitle}>{meeting.title}</h3>
                        <p className={styles.cardDate}>
                          {formatDate(meeting.date, meeting.startTime, meeting.endTime)}
                        </p>
                      </div>
                      <MeetingStatusBadge status={meeting.meetingSyncStatus} />
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaChip}>
                          {getMeetingLinkSourceLabel(meeting.meetingLinkSource)}
                        </span>
                        {typeof meeting.approvedCount === "number" && (
                          <span className={styles.metaChip}>
                            المعتمدون: {meeting.approvedCount}
                          </span>
                        )}
                        {meeting.presenter?.fullName && (
                          <span className={styles.metaChip}>
                            المقدم: {meeting.presenter.fullName}
                          </span>
                        )}
                        {meeting.reportSummary && (
                          <button
                            type="button"
                            className={styles.metaChipBtn}
                            onClick={() => openReport(meeting)}
                            title="عرض تقرير الحضور"
                          >
                            مستورد: {meeting.reportSummary.attendeeCount}
                            {meeting.reportSummary.unmatchedCount > 0
                              ? ` · غير مطابق ${meeting.reportSummary.unmatchedCount}`
                              : ""}
                          </button>
                        )}
                        {meeting.meetingSyncError && (
                          <span className={styles.errorText}>{meeting.meetingSyncError}</span>
                        )}
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.btnInfo}
                          title="فتح الاجتماع"
                          onClick={() => handleLaunch(meeting)}
                          disabled={submitting}
                        >
                          <ExternalLink size={14} />
                        </button>

                        {activeTab === "finished" && (
                          <>
                            <button
                              type="button"
                              className={styles.btnSuccess}
                              title="استيراد الحضور"
                              onClick={() => handleImportReport(meeting)}
                              disabled={submitting}
                            >
                              <Download size={14} />
                            </button>
                            <button
                              type="button"
                              className={styles.btn}
                              title="تقرير الحضور"
                              onClick={() => openReport(meeting)}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              type="button"
                              className={styles.btn}
                              title="مراجعة الحضور"
                              onClick={() => openVolunteers(meeting)}
                            >
                              <Users size={14} />
                            </button>
                          </>
                        )}

                        {(meeting.meetingSyncStatus === MeetingSyncStatus.FAILED ||
                          meeting.meetingSyncStatus === MeetingSyncStatus.PENDING) && (
                          <button
                            type="button"
                            className={styles.btnWarning}
                            title="إعادة المزامنة"
                            onClick={() => handleRetry(meeting)}
                            disabled={submitting}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        <Link
                          href={ROUTES.ACTIVITY_DETAILS(meeting.activityId)}
                          className={styles.btn}
                          title="عرض النشاط"
                        >
                          <Link2 size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                sticky
              />
            </>
          )}
        </>
      )}

      {activeTab === "settings" &&
        (loadingSettings ? (
          <LoadingState />
        ) : (
          <div className={styles.settings}>
            <section className={styles.settingsCard}>
              <div className={styles.settingsHeader}>
                <div>
                  <h2 className={styles.settingsTitle}>اتصال Google Workspace</h2>
                  <p className={styles.settingsHint}>
                    الحساب التنظيمي المستخدم لإنشاء الاجتماعات: {organizerEmail}
                  </p>
                </div>
                <span
                  className={`${styles.connectionBadge} ${
                    integration?.connected ? styles.connected : styles.disconnected
                  }`}
                >
                  {integration?.connected ? "متصل" : "غير متصل"}
                </span>
              </div>

              <div className={styles.settingsGrid}>
                <div className={styles.settingsField}>
                  <span className={styles.fieldLabel}>البريد</span>
                  <span className={styles.fieldValue} dir="ltr">
                    {organizerEmail}
                  </span>
                </div>
                <div className={styles.settingsField}>
                  <span className={styles.fieldLabel}>الحالة</span>
                  <span className={styles.fieldValue}>{integration?.status || "DISCONNECTED"}</span>
                </div>
                <div className={styles.settingsField}>
                  <span className={styles.fieldLabel}>آخر فحص</span>
                  <span className={styles.fieldValue}>
                    {integration?.lastCheckedAt
                      ? new Date(integration.lastCheckedAt).toLocaleString("ar-JO")
                      : "—"}
                  </span>
                </div>
                <div className={styles.settingsField}>
                  <span className={styles.fieldLabel}>الصلاحيات (Scopes)</span>
                  <span className={styles.fieldValue} dir="ltr">
                    {integration?.scopes?.length ? integration.scopes.join(", ") : "—"}
                  </span>
                </div>
              </div>

              {integration?.lastError && (
                <p className={styles.lastError}>
                  <AlertTriangle size={14} />
                  {integration.lastError}
                </p>
              )}

              <div className={styles.settingsActions}>
                {integration?.connected ? (
                  <Button
                    variant="danger"
                    icon={<Unplug size={16} />}
                    onClick={handleDisconnect}
                    loading={submitting}
                  >
                    قطع الاتصال
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    icon={<PlugZap size={16} />}
                    onClick={handleConnect}
                    loading={submitting}
                  >
                    ربط Google
                  </Button>
                )}
              </div>
            </section>

            <section className={styles.settingsCard}>
              <div className={styles.settingsHeader}>
                <div>
                  <h2 className={styles.settingsTitle}>إخفاقات المزامنة</h2>
                  <p className={styles.settingsHint}>أعد محاولة المزامنة للاجتماعات التي فشلت.</p>
                </div>
              </div>

              {failedMeetings.length === 0 ? (
                <EmptyState icon={CheckCircle2} message="لا توجد مزامنات فاشلة حالياً" />
              ) : (
                <div className={styles.list}>
                  {failedMeetings.map((meeting) => (
                    <article key={meeting.activityId} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardMeta}>
                          <h3 className={styles.cardTitle}>{meeting.title}</h3>
                          <p className={styles.cardDate}>
                            {formatDate(meeting.date, meeting.startTime, meeting.endTime)}
                          </p>
                        </div>
                        <MeetingStatusBadge status={meeting.meetingSyncStatus} />
                      </div>
                      <div className={styles.cardBody}>
                        {meeting.meetingSyncError && (
                          <p className={styles.errorText}>{meeting.meetingSyncError}</p>
                        )}
                        <div className={styles.cardActions}>
                          <button
                            type="button"
                            className={styles.btnWarning}
                            title="إعادة المزامنة"
                            onClick={() => handleRetry(meeting)}
                            disabled={submitting}
                          >
                            <RotateCcw size={14} />
                          </button>
                          <Link
                            href={ROUTES.ACTIVITY_DETAILS(meeting.activityId)}
                            className={styles.btn}
                            title="عرض النشاط"
                          >
                            <Link2 size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ))}

      <MeetingReportModal
        isOpen={!!reportMeeting}
        onClose={() => setReportMeeting(null)}
        activityId={reportMeeting?.activityId || ""}
        activityTitle={reportMeeting?.title || ""}
        matchOptions={matchOptions}
        onMatched={refreshMeetings}
      />

      {volunteersMeeting && (
        <VolunteersModal
          activityId={volunteersMeeting.activityId}
          activityTitle={volunteersMeeting.title}
          activityStatus={volunteersMeeting.activityStatus || ActivityStatus.PUBLISHED}
          activityDate={volunteersMeeting.date}
          activityType={ActivityType.ONLINE}
          durationHours={0}
          isOpen={!!volunteersMeeting}
          onClose={() => setVolunteersMeeting(null)}
        />
      )}

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

export default GoogleMeetPage;
