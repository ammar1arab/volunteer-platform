"use client";
import styles from "./VolunteersModal.module.scss";
import { useVolunteersModal } from "./VolunteersModal.logic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AttendanceStatus, ActivityStatus } from "@/core/domain/enums";
import { Modal, LoadingState, EmptyState, ConfirmDialog, ToastContainer } from "@/presentation/components";
import { ROUTES, getCityLabel, getAttendanceStatusLabel } from "@/presentation/constants";
import { MapPin, Calendar, Users as UsersIcon, Archive, Check, X, AlertTriangle, UserMinus } from "lucide-react";
import { useState } from "react";

type Props = {
  activityId: string;
  activityTitle: string;
  activityStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => Promise<boolean>;
};

const VolunteersModal = ({
  activityId, activityTitle, activityStatus, isOpen, onClose, onComplete
}: Props) => {
  const {
    volunteers, loading, completing, rejecting, confirmStep, attendanceWarning, unmarkedCount,
    toasts, removeToast,
    setAttendance, rejectVolunteer, requestComplete, confirmStep1, cancelConfirm,
    confirmComplete, dismissWarning, calculateAge,
  } = useVolunteersModal(activityId, isOpen);

  const router      = useRouter();
  const isCompleted = activityStatus === ActivityStatus.COMPLETED;
  const canComplete = activityStatus === ActivityStatus.PUBLISHED && !!onComplete;
  const canReject   = activityStatus === ActivityStatus.PUBLISHED;

  const [rejectTarget, setRejectTarget] = useState<{ participationId: string; name: string } | null>(null);

  if (completing) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="جارٍ الإكمال..." size="md">
        <div className={styles.completing}>
          <LoadingState />
          <p>يتم تسجيل الحضور وإغلاق النشاط...</p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Modal isOpen={isOpen} onClose={onClose} title="المتطوعون" size="md">
        <div className={styles.wrapper}>

          {attendanceWarning && (
            <div className={styles.warning}>
              <div className={styles.warningIcon}><AlertTriangle size={16} /></div>
              <div className={styles.warningBody}>
                <strong>يوجد {unmarkedCount} متطوع لم يُسجَّل حضوره</strong>
                <span>يجب تسجيل حضور أو غياب جميع المتطوعين قبل إكمال النشاط</span>
              </div>
              <button className={styles.warningClose} onClick={dismissWarning}>
                <X size={14} />
              </button>
            </div>
          )}

          <div className={styles.scrollArea}>
            {loading ? (
              <LoadingState />
            ) : volunteers.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="لا يوجد متطوعون"
                message="لم يتم قبول أي متطوع بعد"
              />
            ) : (
              <div className={styles.list}>
                {volunteers.map((volunteer) => {
                  const attended = volunteer.attendanceStatus === AttendanceStatus.ATTENDED;
                  const absent   = volunteer.attendanceStatus === AttendanceStatus.ABSENT;
                  const unmarked = volunteer.attendanceStatus === AttendanceStatus.NOT_MARKED;
                  const isRejecting = rejecting === volunteer.participationId;

                  return (
                    <div
                      key={volunteer.participationId}
                      className={`${styles.card} ${attendanceWarning && unmarked ? styles.cardWarn : ""}`}
                      onClick={() => { onClose(); router.push(ROUTES.ADMIN.USER_DETAILS(volunteer.id)); }}
                    >
                      <div className={styles.avatar}>
                        {volunteer.profilePictureUrl ? (
                          <Image src={volunteer.profilePictureUrl} alt={volunteer.fullName}
                            width={44} height={44} className={styles.avatarImage} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {volunteer.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className={styles.info}>
                        <div className={styles.nameRow}>
                          <h3 className={styles.name}>{volunteer.fullName}</h3>
                          {canReject && (
                            <button
                              className={styles.rejectBtn}
                              disabled={isRejecting}
                              title="إزالة من النشاط"
                              onClick={e => {
                                e.stopPropagation();
                                setRejectTarget({ participationId: volunteer.participationId, name: volunteer.fullName });
                              }}
                            >
                              <UserMinus size={13} />
                            </button>
                          )}
                        </div>

                        <div className={styles.meta}>
                          <span className={styles.metaItem}>{volunteer.phone}</span>
                          {volunteer.city && (
                            <span className={styles.metaItem}>
                              <MapPin size={11} />{getCityLabel(volunteer.city)}
                            </span>
                          )}
                          {volunteer.dateOfBirth && (
                            <span className={styles.metaItem}>
                              <Calendar size={11} />{calculateAge(volunteer.dateOfBirth)} سنة
                            </span>
                          )}
                        </div>

                        {!isCompleted && (
                          <div className={styles.attendanceRow} onClick={e => e.stopPropagation()}>
                            <button
                              className={`${styles.attendBtn} ${styles.attended} ${attended ? styles.active : ""}`}
                              onClick={() => setAttendance(volunteer.participationId, attended ? null : true)}
                              title="حضر"
                            >
                              <Check size={14} /><span>حضر</span>
                            </button>
                            <button
                              className={`${styles.attendBtn} ${styles.absent} ${absent ? styles.active : ""}`}
                              onClick={() => setAttendance(volunteer.participationId, absent ? null : false)}
                              title="غائب"
                            >
                              <X size={14} /><span>غائب</span>
                            </button>
                            {unmarked && (
                              <span className={`${styles.notMarked} ${attendanceWarning ? styles.notMarkedWarn : ""}`}>
                                لم يُسجَّل
                              </span>
                            )}
                          </div>
                        )}

                        {isCompleted && (
                          <div className={styles.attendanceResult}>
                            {attended && <span className={styles.resultAttended}><Check size={11} /> حضر</span>}
                            {absent   && <span className={styles.resultAbsent}><X size={11} /> غائب</span>}
                            {unmarked && <span className={styles.notMarked}>{getAttendanceStatusLabel(AttendanceStatus.NOT_MARKED)}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.stickyFooter}>
            <p className={styles.count}>
              إجمالي: <strong>{volunteers.length}</strong>
              {!isCompleted && unmarkedCount > 0 && (
                <span className={styles.countWarn}> · {unmarkedCount} لم يُسجَّل</span>
              )}
            </p>
            {canComplete && (
              <button className={styles.btnComplete} onClick={requestComplete}>
                <Archive size={15} />
                إكمال النشاط
              </button>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={() => {
          if (rejectTarget) rejectVolunteer(rejectTarget.participationId, rejectTarget.name);
          setRejectTarget(null);
        }}
        title="إزالة متطوع"
        message={`هل تريد إزالة "${rejectTarget?.name}" من النشاط؟ سيتم رفض مشاركته وإفراغ مكانه.`}
        confirmText="إزالة"
        cancelText="إلغاء"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmStep === 1}
        onClose={cancelConfirm}
        onConfirm={confirmStep1}
        title="تأكيد إكمال النشاط"
        message={`سيتم إغلاق نشاط "${activityTitle}" وتسجيل ساعات التطوع للمتطوعين الحاضرين.`}
        warning="لن تتمكن من تعديل النشاط أو قبول متطوعين جدد بعد هذه الخطوة."
        confirmText="نعم، متأكد"
        cancelText="رجوع"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={confirmStep === 2}
        onClose={cancelConfirm}
        onConfirm={() => onComplete && confirmComplete(onComplete, onClose)}
        title="تأكيد نهائي"
        message="هذا الإجراء لا يمكن التراجع عنه نهائياً."
        warning="بمجرد الإكمال لن تتمكن من تعديل النشاط أو سجلات الحضور."
        confirmText="تأكيد الإكمال النهائي"
        cancelText="إلغاء"
        variant="danger"
      />
    </>
  );
};

export default VolunteersModal;