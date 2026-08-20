"use client";
import styles from "./NotificationPreviewModal.module.scss";
import { useMemo } from "react";
import { Users, MapPin, User2, Check, Clock } from "lucide-react";
import { Modal, ConfirmDialog, EmptyState, Pagination, UserList } from "@/presentation/components";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
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
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.notificationPreviewModal.currentPage",
    1
  );

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
              <UserList
                users={paginated.map(u => ({
                  id: u.id,
                  name: u.name,
                  email: u.email || "",
                  phone: u.phone,
                  avatarUrl: u.avatarUrl,
                  meta: [
                    u.city ? { value: getCityLabel(u.city as JordanianCity), icon: MapPin } : null,
                    u.gender ? { value: getGenderLabel(u.gender as Gender), icon: User2 } : null,
                    u.hours !== undefined && u.hours > 0 ? { value: `${u.hours} ساعة`, icon: Clock } : null,
                    u.certifications ? { value: `${u.certifications} شهادة`, icon: require("lucide-react").Award } : null,
                  ].filter(Boolean) as any
                }))}
                layout="list"
                selectable
                selectedIds={selectedIds}
                onToggleUser={onToggleUser}
              />
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            compact
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