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
  Button,
  Dropdown,
  MeetingReportModal,
  VolunteersModal,
  MeetingListItem,
  InfoCard
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { ActivityType, ActivityStatus } from "@/core/domain/enums";
import { useRouter } from "next/navigation";
import {
  Video,
  AlertTriangle,
  CheckCircle2,
  PlugZap,
  Unplug,
  Mail,
  Shield,
  Clock3,
  Settings2
} from "lucide-react";

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
    filtered,
    paginated,
    sectionTitle,
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

  if (status === "loading") return <LoadingState />;

  const showMeetings = activeView === "upcoming" || activeView === "finished";
  const loadingMeetings = showMeetings && (meetingsLoading || integrationLoading);
  const loadingSettings = activeView === "settings" && (integrationLoading || meetingsLoading);

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <section className={`${styles.integrationCard} ${connected ? styles.connectedCard : styles.disconnectedCard}`}>
        <div className={styles.integrationMain}>
          <div className={styles.providerMark} aria-hidden>
            <Video size={20} />
          </div>
          <div className={styles.integrationCopy}>
            <div className={styles.integrationTitleRow}>
              <h2 className={styles.integrationTitle}>Google Meet</h2>
              <span className={`${styles.connectionBadge} ${connected ? styles.connected : styles.disconnected}`}>
                {connected ? "متصل" : "غير متصل"}
              </span>
            </div>
            <p className={styles.integrationMeta} dir="ltr">
              {organizerEmail}
            </p>
            {integration?.lastCheckedAt && (
              <p className={styles.integrationChecked}>
                آخر فحص: {new Date(integration.lastCheckedAt).toLocaleString("ar-JO")}
              </p>
            )}
            {integration?.lastError && (
              <p className={styles.integrationError}>
                <AlertTriangle size={13} />
                {integration.lastError}
              </p>
            )}
          </div>
        </div>

        <div className={styles.integrationActions}>
          {connected ? (
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
          <button
            type="button"
            className={styles.settingsBtn}
            title="الإعدادات"
            onClick={() => setActiveView("settings")}
          >
            <Settings2 size={16} />
          </button>
        </div>
      </section>

      {!connected && (
        <div className={styles.warnBanner}>
          <AlertTriangle size={16} />
          <span>
            اربط حساب Google حقيقي (Gmail) مضاف كـ Test user في Google Cloud. البريد{" "}
            <span dir="ltr">contact@youthprints.online</span> ليس حساب Google.
            {" "}
            <button type="button" onClick={handleConnect}>
              ربط الآن
            </button>
          </span>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.sectionHead}>
          <div className={styles.titleGroup}>
            <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
            {showMeetings && <span className={styles.count}>{filtered.length}</span>}
            {activeView === "settings" && failedMeetings.length > 0 && (
              <span className={styles.countWarn}>{failedMeetings.length} فشل</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {showMeetings && (
            <div className={styles.searchWrap}>
              <Search
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={setAppliedSearch}
                placeholder="ابحث..."
              />
            </div>
          )}
          <div className={`${styles.actionsEnd} ${!showMeetings ? styles.actionsEndSolo : ""}`}>
            <Dropdown
              items={viewItems}
              active={activeView}
              onChange={(key) => setActiveView(key as typeof activeView)}
              placeholder="العرض"
              compact
            />
            {showMeetings && (
              <Dropdown
                items={syncFilterItems}
                active={syncFilter}
                onChange={setSyncFilter}
                placeholder="المزامنة"
                compact
              />
            )}
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
            <div className={styles.infoGrid}>
              <InfoCard icon={Mail} label="البريد التنظيمي" value={organizerEmail} />
              <InfoCard
                icon={PlugZap}
                label="حالة الاتصال"
                value={connected ? "متصل" : "غير متصل"}
              />
              <InfoCard
                icon={Clock3}
                label="آخر فحص"
                value={
                  integration?.lastCheckedAt
                    ? new Date(integration.lastCheckedAt).toLocaleString("ar-JO")
                    : "—"
                }
              />
              <InfoCard
                icon={Shield}
                label="الصلاحيات"
                value={integration?.scopes?.length ? integration.scopes.join(", ") : "—"}
              />
            </div>

            <section className={styles.failedSection}>
              <div className={styles.titleGroup}>
                <h3 className={styles.failedTitle}>إخفاقات المزامنة</h3>
                <span className={styles.count}>{failedMeetings.length}</span>
              </div>

              {failedMeetings.length === 0 ? (
                <EmptyState icon={CheckCircle2} message="لا توجد مزامنات فاشلة حالياً" />
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
