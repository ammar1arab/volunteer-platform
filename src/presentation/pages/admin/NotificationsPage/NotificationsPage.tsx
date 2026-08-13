"use client";
import styles from "./NotificationsPage.module.scss";
import { useMemo } from "react";
import {
  Send, Bell, Users, MapPin, User2, Clock, UserCheck,
  Eye, Trash2, Search, CheckSquare, Hourglass, BadgeCheck,
} from "lucide-react";
import {
  LoadingState, EmptyState, ToastContainer, SelectInput,
  Button, NotificationPreviewModal, ConfirmDialog, Pagination, BroadcastRecipientsModal
} from "@/presentation/components";
import {
  useNotificationsPageLogic,
  CITY_OPTIONS, TARGET_OPTIONS, GENDER_OPTIONS, relativeTime,
} from "./NotificationsPage.logic";
import { getCityLabel, getGenderLabel } from "@/presentation/constants";
import type { BroadcastDto } from "@/core/application/dtos";
import { Gender, JordanianCity } from "@/core/domain/enums";

const TARGET_ICON: Record<string, React.ReactNode> = {
  ALL: <Users size={11} />,
  CITY: <MapPin size={11} />,
  GENDER: <User2 size={11} />,
  HOURS: <Clock size={11} />,
  ACTIVITY_PENDING: <Hourglass size={11} />,
  ACTIVITY_APPROVED: <BadgeCheck size={11} />,
  USERS: <UserCheck size={11} />,
};

const getTargetLabel = (b: BroadcastDto, activityTitleMap: Map<string, string>) => {
  if (b.target === "ALL") return "جميع المتطوعين";
  if (b.target === "CITY") return getCityLabel(b.targetValue as JordanianCity);
  if (b.target === "GENDER") return getGenderLabel(b.targetValue as Gender);
  if (b.target === "HOURS") return `أكثر من ${b.targetValue} ساعة`;
  if (b.target === "ACTIVITY_PENDING") return `طلبات معلقة — ${activityTitleMap.get(b.targetValue ?? "") ?? "نشاط"}`;
  if (b.target === "ACTIVITY_APPROVED") return `مقبولون في — ${activityTitleMap.get(b.targetValue ?? "") ?? "نشاط"}`;
  if (b.target === "USERS") return "اختيار يدوي";
  return b.targetValue ?? "";
};

const VOLUNTEERS_PER_PAGE = 8;

const NotificationsPage = () => {
  const {
    status, form, submitStatus, loadingPreview, isFormInvalid,
    broadcasts, loadingBroadcasts, clearingBroadcasts,
    paginatedBroadcasts, broadcastsPage, setBroadcastsPage,
    broadcastsTotalItems, broadcastsPerPage,
    toasts, removeToast,
    previewUsers, selectedIds, showPreview, showConfirm,
    setField, handleSubmit, toggleUser, toggleAll,
    setShowConfirm, handleSendConfirmed, closePreview,
    showClearConfirm, setShowClearConfirm, handleClearBroadcasts,
    filteredVolunteers, loadingVolunteers,
    volunteerSearch, setVolunteerSearch,
    volunteersPage, setVolunteersPage,
    directSelectedIds, toggleDirectUser, toggleAllDirect,
    recipientsState, openRecipientsModal, closeRecipientsModal,
    showDeleteConfirm, deletingId,
    requestDeleteBroadcast, cancelDeleteBroadcast, confirmDeleteBroadcast,
    activityOptions, activityTitleMap, loadingActivities,
  } = useNotificationsPageLogic();

  const paginatedVolunteers = useMemo(
    () => filteredVolunteers.slice(
      (volunteersPage - 1) * VOLUNTEERS_PER_PAGE,
      volunteersPage * VOLUNTEERS_PER_PAGE
    ),
    [filteredVolunteers, volunteersPage]
  );

  if (status === "loading") return <LoadingState />;

  const isSubmitting = submitStatus === "loading";
  const allDirectVisible =
    filteredVolunteers.length > 0 &&
    filteredVolunteers.every(v => directSelectedIds.has(v.id));

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearBroadcasts}
        title="مسح السجل كاملاً"
        message="سيتم حذف جميع الإشعارات المرسلة من السجل نهائياً."
        warning="لا يمكن التراجع عن هذا الإجراء."
        confirmText={clearingBroadcasts ? "جارٍ المسح..." : "مسح الكل"}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteBroadcast}
        onConfirm={confirmDeleteBroadcast}
        title="حذف الإشعار"
        message="سيتم حذف هذا الإشعار من قائمة جميع المستقبلين فوراً."
        confirmText={deletingId ? "جارٍ الحذف..." : "حذف"}
        variant="danger"
      />

      <BroadcastRecipientsModal
        isOpen={recipientsState.open}
        onClose={closeRecipientsModal}
        broadcastTitle={recipientsState.title}
        recipients={recipientsState.recipients}
        loading={recipientsState.loading}
      />

      <div className={styles.grid}>


        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <Bell size={16} />
            <h2>إرسال إشعار جديد</h2>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>العنوان</label>
              <input
                className={styles.input}
                value={form.title}
                onChange={e => setField("title", e.target.value)}
                maxLength={200}
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الرسالة</label>
              <textarea
                className={styles.textarea}
                value={form.message}
                onChange={e => setField("message", e.target.value)}
                rows={5}
                maxLength={1000}
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            <div className={styles.field}>
              <SelectInput
                label="الاستهداف"
                value={form.target}
                options={TARGET_OPTIONS}
                onChange={val => setField("target", val)}
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            {form.target === "CITY" && (
              <div className={styles.field}>
                <SelectInput
                  label="المدينة"
                  value={form.targetValue ?? ""}
                  options={[{ value: "", label: "اختر مدينة" }, ...CITY_OPTIONS]}
                  onChange={val => setField("targetValue", val)}
                  disabled={isSubmitting || loadingPreview}
                />
              </div>
            )}

            {form.target === "GENDER" && (
              <div className={styles.field}>
                <SelectInput
                  label="الجنس"
                  value={form.targetValue ?? ""}
                  options={[{ value: "", label: "اختر" }, ...GENDER_OPTIONS]}
                  onChange={val => setField("targetValue", val)}
                  disabled={isSubmitting || loadingPreview}
                />
              </div>
            )}

            {form.target === "HOURS" && (
              <div className={styles.field}>
                <label className={styles.label}>الحد الأدنى من الساعات</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  className={styles.input}
                  value={form.targetValue ?? ""}
                  onChange={e => setField("targetValue", e.target.value)}
                  disabled={isSubmitting || loadingPreview}
                />
              </div>
            )}

            {(form.target === "ACTIVITY_PENDING" || form.target === "ACTIVITY_APPROVED") && (
              <div className={styles.field}>
                <SelectInput
                  label="النشاط"
                  value={form.targetValue ?? ""}
                  options={[{ value: "", label: "اختر نشاطاً" }, ...activityOptions]}
                  onChange={val => setField("targetValue", val)}
                  disabled={isSubmitting || loadingPreview || loadingActivities}
                />
              </div>
            )}

            {form.target === "USERS" && (
              <div className={styles.field}>
                <div className={styles.usersHeader}>
                  <label className={styles.label}>اختر المتطوعين</label>
                  {directSelectedIds.size > 0 && (
                    <span className={styles.selectedBadge}>{directSelectedIds.size} محدد</span>
                  )}
                </div>

                <div className={styles.userSearchWrap}>
                  <Search size={13} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.userSearchInput}
                    value={volunteerSearch}
                    onChange={e => setVolunteerSearch(e.target.value)}
                    placeholder="ابحث بالاسم..."
                    disabled={loadingVolunteers}
                  />
                </div>

                {loadingVolunteers ? (
                  <div className={styles.volunteersLoading}><LoadingState compact /></div>
                ) : (
                  <>
                    <div className={styles.userList}>
                      {filteredVolunteers.length > 0 && (
                        <div className={styles.userItem} onClick={toggleAllDirect}>
                          <span className={`${styles.checkbox} ${allDirectVisible ? styles.checkboxActive : ""}`}>
                            {allDirectVisible && <CheckSquare size={11} />}
                          </span>
                          <span className={styles.userName}>
                            تحديد الكل ({filteredVolunteers.length})
                          </span>
                        </div>
                      )}
                      {paginatedVolunteers.map(v => (
                        <div
                          key={v.id}
                          className={`${styles.userItem} ${directSelectedIds.has(v.id) ? styles.userItemSelected : ""}`}
                          onClick={() => toggleDirectUser(v.id)}
                        >
                          <span className={`${styles.checkbox} ${directSelectedIds.has(v.id) ? styles.checkboxActive : ""}`} />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{v.name}</span>
                            {v.hours !== undefined && (
                              <span className={styles.userHours}>{v.hours} ساعة</span>
                            )}

                          </div>
                        </div>
                      ))}
                      {filteredVolunteers.length === 0 && (
                        <p className={styles.noResults}>لا توجد نتائج</p>
                      )}
                    </div>

                    <Pagination
                      currentPage={volunteersPage}
                      totalItems={filteredVolunteers.length}
                      itemsPerPage={VOLUNTEERS_PER_PAGE}
                      onPageChange={setVolunteersPage}
                    />
                  </>
                )}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                رابط <span className={styles.optional}>(اختياري)</span>
              </label>
              <input
                className={styles.input}
                value={form.link ?? ""}
                onChange={e => setField("link", e.target.value)}
                type="url"
                dir="ltr"
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Send size={14} />}
              iconPosition="left"
              disabled={isFormInvalid || isSubmitting || loadingPreview}
            >
              {loadingPreview ? "جاري التحميل..." : isSubmitting ? "جاري الإرسال..." : "معاينة ثم إرسال"}
            </Button>
          </form>
        </section>


        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <Bell size={16} />
            <h2>سجل الإشعارات المرسلة</h2>
            {broadcasts.length > 0 && (
              <button
                className={styles.clearBtn}
                onClick={() => setShowClearConfirm(true)}
                disabled={clearingBroadcasts}
              >
                مسح الكل
              </button>
            )}
          </div>

          {loadingBroadcasts ? (
            <LoadingState />
          ) : broadcasts.length === 0 ? (
            <EmptyState icon={Bell} message="لم يُرسل أي إشعار بعد" />
          ) : (
            <div className={styles.broadcastListWrapper}>
              <div className={styles.broadcastList}>
                {paginatedBroadcasts.map(b => (
                  <div key={b.broadcastId} className={styles.broadcastItem}>
                    <div className={styles.broadcastTop}>
                      <span className={styles.broadcastTitle}>{b.title}</span>
                      <span className={styles.broadcastTag}>
                        {TARGET_ICON[b.target]}
                        {getTargetLabel(b, activityTitleMap)}
                      </span>
                    </div>
                    <p className={styles.broadcastMsg}>{b.message}</p>
                    <div className={styles.broadcastBottom}>
                      <div className={styles.broadcastMeta}>
                        <span className={styles.recipients}>
                          <Users size={11} /> {b.totalRecipients} متطوع
                        </span>
                        <span className={styles.time}>{relativeTime(b.createdAt)}</span>
                      </div>
                      <div className={styles.broadcastActions}>
                        <button
                          className={styles.btnRecipients}
                          onClick={() => openRecipientsModal(b.broadcastId, b.title)}
                        >
                          <Eye size={12} /> المستقبلون
                        </button>
                        <button
                          className={styles.btnDeleteBroadcast}
                          onClick={() => requestDeleteBroadcast(b.broadcastId)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={broadcastsPage}
                totalItems={broadcastsTotalItems}
                itemsPerPage={broadcastsPerPage}
                onPageChange={setBroadcastsPage}
              />
            </div>
          )}
        </section>

      </div>

      <NotificationPreviewModal
        isOpen={showPreview}
        users={previewUsers}
        selectedIds={selectedIds}
        isSending={isSubmitting}
        showConfirm={showConfirm}
        onToggleUser={toggleUser}
        onToggleAll={toggleAll}
        onRequestSend={() => setShowConfirm(true)}
        onConfirmSend={handleSendConfirmed}
        onCancelConfirm={() => setShowConfirm(false)}
        onClose={closePreview}
      />
    </>
  );
};

export default NotificationsPage;