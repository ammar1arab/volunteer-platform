"use client";

import styles from "./GoogleMeetPage.module.scss";
import { useGoogleMeetPage } from "./GoogleMeetPage.logic";
import {
  LoadingState,
  EmptyState,
  ToastContainer,
  ConfirmDialog,
  Search,
  Pagination,
  Dropdown,
  MeetingReportModal,
  VolunteersModal,
  MeetingListItem,
  Badge
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { ActivityType, ActivityStatus } from "@/core/domain/enums";
import { useRouter } from "next/navigation";
import { Video, PlugZap, Unplug, Settings2 } from "lucide-react";
import type { GoogleMeetView } from "./GoogleMeetPage.logic";

const GoogleMeetPage = () => {
  const router = useRouter();
  const {
    status,
    activeView,
    setActiveView,
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
    viewItems,
    listView,
    filtered,
    paginated,
    meetingsLoading,
    failedLoading,
    integrationLoading,
    submitting,
    integration,
    organizerEmail,
    connected,
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

  const showMeetings = activeView === "upcoming" || activeView === "finished";
  const loadingMeetings = showMeetings && meetingsLoading;
  const loadingSettings = activeView === "settings" && integrationLoading;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div className={styles.actions}>
          {showMeetings && (
            <Search
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setAppliedSearch}
              placeholder="ابحث..."
            />
          )}
          <div className={styles.actionsEnd}>
            {showMeetings && (
              <>
                <Dropdown
                  items={viewItems}
                  active={activeView}
                  onChange={(key) => setActiveView(key as GoogleMeetView)}
                  placeholder="العرض"
                  compact
                />
                <Dropdown
                  items={syncFilterItems}
                  active={syncFilter}
                  onChange={setSyncFilter}
                  placeholder="المزامنة"
                  compact
                />
              </>
            )}
            <button
              type="button"
              className={`${styles.btnSettings} ${activeView === "settings" ? styles.btnSettingsActive : ""}`}
              title="الإعدادات"
              aria-label="الإعدادات"
              aria-pressed={activeView === "settings"}
              onClick={() =>
                setActiveView(activeView === "settings" ? listView : "settings")
              }
            >
              <Settings2 size={16} />
            </button>
            <button
              type="button"
              className={connected ? styles.btnDisconnect : styles.btnConnect}
              onClick={connected ? handleDisconnect : handleConnect}
              disabled={submitting}
            >
              {connected ? <Unplug size={16} /> : <PlugZap size={16} />}
              {connected ? "قطع الاتصال" : "ربط Google"}
            </button>
          </div>
        </div>
      </header>

      {showMeetings &&
        (loadingMeetings ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Video}
            message={
              appliedSearch || syncFilter !== "ALL"
                ? "لا توجد نتائج للبحث"
                : activeView === "upcoming"
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
                <MeetingListItem
                  key={meeting.activityId}
                  meeting={meeting}
                  mode={activeView as "upcoming" | "finished"}
                  submitting={submitting}
                  onLaunch={handleLaunch}
                  onRetry={handleRetry}
                  onImportReport={handleImportReport}
                  onOpenReport={openReport}
                  onOpenVolunteers={openVolunteers}
                />
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
        ))}

      {activeView === "settings" &&
        (loadingSettings ? (
          <LoadingState />
        ) : (
          <div className={styles.settings}>
            <section className={styles.panel}>
              <div className={styles.panelTop}>
                <div className={styles.identity}>
                  <span className={`${styles.dot} ${connected ? styles.dotOn : styles.dotOff}`} />
                  <div className={styles.identityCopy}>
                    <div className={styles.panelTitleRow}>
                      <h3 className={styles.panelTitle}>حساب Google</h3>
                      <Badge variant={connected ? "success" : "danger"}>
                        {connected ? "متصل" : "غير متصل"}
                      </Badge>
                    </div>
                    <p className={styles.email} dir="ltr">{organizerEmail}</p>
                  </div>
                </div>
              </div>

              {integration?.lastError && (
                <p className={styles.error}>{integration.lastError}</p>
              )}
            </section>

            <section className={styles.failedSection}>
              <div className={styles.titleGroup}>
                <h3 className={styles.failedTitle}>إخفاقات المزامنة</h3>
                <span className={styles.count}>{failedMeetings.length}</span>
              </div>

              {failedLoading ? (
                <LoadingState />
              ) : failedMeetings.length === 0 ? (
                <p className={styles.muted}>لا توجد مزامنات فاشلة حالياً</p>
              ) : (
                <div className={styles.list}>
                  {failedMeetings.map((meeting) => (
                    <MeetingListItem
                      key={meeting.activityId}
                      meeting={meeting}
                      mode="upcoming"
                      submitting={submitting}
                      onLaunch={handleLaunch}
                      onRetry={handleRetry}
                    />
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
