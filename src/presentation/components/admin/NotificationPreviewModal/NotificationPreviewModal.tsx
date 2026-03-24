"use client";
import styles from "./NotificationPreviewModal.module.scss";
import { useState, useMemo } from "react";
import { Users, MapPin, User2, Check, Clock } from "lucide-react";
import { Modal, ConfirmDialog, EmptyState, Pagination } from "@/presentation/components";
import type { PreviewUserDto } from "@/core/application/dtos";
import { getCityLabel, getGenderLabel } from "@/presentation/constants";
import { JordanianCity, Gender } from "@/core/domain/enums";

interface Props {
  isOpen:          boolean;
  users:           PreviewUserDto[];
  selectedIds:     Set<string>;
  isSending:       boolean;
  showConfirm:     boolean;
  onToggleUser:    (id: string) => void;
  onToggleAll:     () => void;
  onRequestSend:   () => void;
  onConfirmSend:   () => void;
  onCancelConfirm: () => void;
  onClose:         () => void;
}

const ITEMS_PER_PAGE = 8;

const NotificationPreviewModal = ({
  isOpen, users, selectedIds, isSending, showConfirm,
  onToggleUser, onToggleAll, onRequestSend, onConfirmSend, onCancelConfirm, onClose,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return users.slice(start, start + ITEMS_PER_PAGE);
  }, [users, currentPage]);

  const allSelected  = selectedIds.size === users.length && users.length > 0;
  const noneSelected = selectedIds.size === 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="المتطوعون المستهدفون" size="md">
        <div className={styles.wrapper}>

          <div className={styles.topBar}>
            <span className={styles.count}>
              <strong>{selectedIds.size}</strong> من {users.length} محدد
            </span>
            <button className={styles.toggleAll} onClick={onToggleAll}>
              {allSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
          </div>

          <div className={styles.scrollArea}>
            {users.length === 0 ? (
              <EmptyState icon={Users} message="لا يوجد متطوعون" />
            ) : (
              <div className={styles.list}>
                {paginated.map(u => {
                  const checked = selectedIds.has(u.id);
                  return (
                    <div
                      key={u.id}
                      className={`${styles.card} ${checked ? styles.cardChecked : ""}`}
                      onClick={() => onToggleUser(u.id)}
                    >
                      <div className={`${styles.checkbox} ${checked ? styles.checkboxActive : ""}`}>
                        {checked && <Check size={11} />}
                      </div>
                      <div className={styles.info}>
                        <span className={styles.name}>{u.name}</span>
                        <div className={styles.meta}>
                          {u.city && (
                            <span className={styles.metaItem}>
                              <MapPin size={10} />
                              {getCityLabel(u.city as JordanianCity)}
                            </span>
                          )}
                          {u.gender && (
                            <span className={styles.metaItem}>
                              <User2 size={10} />
                              {getGenderLabel(u.gender as Gender)}
                            </span>
                          )}
                          {u.hours !== undefined && u.hours > 0 && (
                            <span className={styles.metaItem}>
                              <Clock size={10} />
                              {u.hours} ساعة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />

          <div className={styles.footer}>
            <button className={styles.btnCancel} onClick={onClose} disabled={isSending}>
              إلغاء
            </button>
            <button
              className={styles.btnSend}
              onClick={onRequestSend}
              disabled={isSending || noneSelected}
            >
              {isSending ? "جاري الإرسال..." : `إرسال لـ ${selectedIds.size} متطوع`}
            </button>
          </div>

        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={onCancelConfirm}
        onConfirm={onConfirmSend}
        title="تأكيد الإرسال"
        message={`سيتم إرسال الإشعار لـ ${selectedIds.size} متطوع. هل أنت متأكد؟`}
        confirmText="إرسال"
        cancelText="رجوع"
        variant="primary"
      />
    </>
  );
};

export default NotificationPreviewModal;