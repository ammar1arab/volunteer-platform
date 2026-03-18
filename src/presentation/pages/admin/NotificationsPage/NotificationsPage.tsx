"use client";

import styles from "./NotificationsPage.module.scss";
import { Send, Bell, Users, MapPin, User2 } from "lucide-react";
import { LoadingState, EmptyState, ToastContainer, SelectInput, Button, NotificationPreviewModal } from "@/presentation/components";
import {
  useNotificationsPageLogic,
  CITY_OPTIONS, TARGET_OPTIONS, GENDER_OPTIONS, relativeTime,
} from "./NotificationsPage.logic";
import { getCityLabel, getGenderLabel } from "@/presentation/constants";
import { Gender, JordanianCity } from "@/core/domain/enums";

const TARGET_ICON: Record<string, React.ReactNode> = {
  ALL: <Users size={11} />,
  CITY: <MapPin size={11} />,
  GENDER: <User2 size={11} />,
};

const NotificationsPage = () => {
  const {
    status, form, submitStatus, loadingPreview,
    broadcasts, loadingBroadcasts,
    toasts, removeToast,
    previewUsers, selectedIds, showPreview, showConfirm,
    setField, handleSubmit,
    toggleUser, toggleAll,
    setShowConfirm, handleSendConfirmed, closePreview,
    handleClearBroadcasts, clearingBroadcasts
  } = useNotificationsPageLogic();

  if (status === "loading") return <LoadingState />;

  const isSubmitting = submitStatus === "loading";
  const isDisabled =
    isSubmitting ||
    loadingPreview ||
    !form.title.trim() ||
    !form.message.trim() ||
    ((form.target === "CITY" || form.target === "GENDER") && !form.targetValue);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.grid}>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <Bell size={16} />
            <h2>سجل الإشعارات المرسلة</h2>
            {broadcasts.length > 0 && (
              <button
                className={styles.clearBtn}
                onClick={handleClearBroadcasts}
                disabled={clearingBroadcasts}
              >
                {clearingBroadcasts ? "جاري المسح..." : "مسح السجل"}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>العنوان</label>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الرسالة</label>
              <textarea
                className={styles.textarea}
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                rows={3}
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            <div className={styles.field}>
              <SelectInput
                label="الاستهداف"
                value={form.target}
                options={TARGET_OPTIONS}
                onChange={(val) => setField("target", val)}
                disabled={isSubmitting || loadingPreview}
              />
            </div>

            {form.target === "CITY" && (
              <div className={styles.field}>
                <SelectInput
                  label="المدينة"
                  value={form.targetValue ?? ""}
                  options={[{ value: "", label: "اختر مدينة" }, ...CITY_OPTIONS]}
                  onChange={(val) => setField("targetValue", val)}
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
                  onChange={(val) => setField("targetValue", val)}
                  disabled={isSubmitting || loadingPreview}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>
                رابط <span className={styles.optional}>(اختياري)</span>
              </label>
              <input
                className={styles.input}
                value={form.link ?? ""}
                onChange={(e) => setField("link", e.target.value)}
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
              disabled={isDisabled}
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
                onClick={handleClearBroadcasts}
                disabled={clearingBroadcasts}
              >
                {clearingBroadcasts ? "جاري المسح..." : "مسح السجل"}
              </button>
            )}
          </div>

          {loadingBroadcasts ? (
            <LoadingState />
          ) : broadcasts.length === 0 ? (
            <EmptyState icon={Bell} message="لم يُرسل أي إشعار بعد" />
          ) : (
            <div className={styles.broadcastList}>
              {broadcasts.map((b) => (
                <div key={b.broadcastId} className={styles.broadcastItem}>
                  <div className={styles.broadcastTop}>
                    <span className={styles.broadcastTitle}>{b.title}</span>
                    <span className={styles.broadcastTag}>
                      {TARGET_ICON[b.target]}
                      {b.target === "ALL" ? "الجميع" :
                        b.target === "CITY" ? getCityLabel(b.targetValue as JordanianCity) :
                          b.target === "GENDER" ? getGenderLabel(b.targetValue as Gender) :
                            b.targetValue}
                    </span>
                  </div>
                  <p className={styles.broadcastMsg}>{b.message}</p>
                  <div className={styles.broadcastBottom}>
                    <span className={styles.recipients}>
                      <Users size={11} /> {b.totalRecipients} متطوع
                    </span>
                    <span className={styles.time}>{relativeTime(b.createdAt)}</span>
                  </div>
                </div>
              ))}
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