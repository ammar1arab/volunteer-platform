"use client";

import { useRef } from "react";
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
import {
  Video,
  PlugZap,
  Unplug,
  Settings2
} from "lucide-react";
import type { GoogleMeetView } from "./GoogleMeetPage.logic";

const SCOPE_LABELS: Record<string, string> = {
  "https://www.googleapis.com/auth/calendar.events": "أحداث التقويم",
  "https://www.googleapis.com/auth/meetings.space.created": "إنشاء اجتماعات Meet",
  "https://www.googleapis.com/auth/meetings.space.readonly": "قراءة اجتماعات Meet"
};

const scopeLabel = (scope: string) =>
  SCOPE_LABELS[scope] ?? scope.split("/").pop() ?? scope;

const GoogleMeetPage = () => {
  const router = useRouter();
  const lastMeetView = useRef<Exclude<GoogleMeetView, "settings">>("upcoming");
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
    filtered,
    paginated,
    meetingsLoading,
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

  if (activeView === "upcoming" || activeView === "finished") {
    lastMeetView.current = activeView;
  }

  if (status === "loading") return <LoadingState />;

  const showMeetings = activeView === "upcoming" || activeView === "finished";
  const loadingMeetings = showMeetings && (meetingsLoading || integrationLoading);
  const loadingSettings = activeView === "settings" && (integrationLoading || meetingsLoading);
  const lastChecked = integration?.lastCheckedAt
    ? new Date(integration.lastCheckedAt).toLocaleString("ar-JO")
    : "—";
  const scopes = integration?.scopes ?? [];

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {!connected && (
        <div className={styles.warn}>
          اربط حساب Google حقيقي (Gmail) مضاف كـ Test user في Google Cloud. البريد{" "}
          <span dir="ltr">contact@youthprints.online</span> ليس حساب Google.
          {integration?.lastError ? ` ${integration.lastError}` : ""}
        </div>
      )}

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
                setActiveView(activeView === "settings" ? lastMeetView.current : "settings")
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
                    <p className={styles.checked}>آخر فحص: {lastChecked}</p>
                  </div>
                </div>
              </div>

              {integration?.lastError && (
                <p className={styles.error}>{integration.lastError}</p>
              )}

              <div className={styles.scopes}>
                {scopes.length > 0 ? (
                  scopes.map((scope) => (
                    <span key={scope} className={styles.chip}>{scopeLabel(scope)}</span>
                  ))
                ) : (
                  <span className={styles.muted}>لا توجد صلاحيات مرتبطة</span>
                )}
              </div>
            </section>

            <section className={styles.failedSection}>
              <div className={styles.titleGroup}>
                <h3 className={styles.failedTitle}>إخفاقات المزامنة</h3>
                <span className={styles.count}>{failedMeetings.length}</span>
              </div>

              {failedMeetings.length === 0 ? (
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
