"use client";
import styles from "./ParticipationRequestsPage.module.scss";
import { useParticipationRequestsPage } from "./ParticipationRequestsPage.logic";
import { LoadingState, EmptyState, ToastContainer, ConfirmDialog, ParticipationRequestItem, Dropdown } from "@/presentation/components";
import { CheckCircle, CheckCheck } from "lucide-react";

const ParticipationRequestsPage = () => {
  const {
    status,
    loading,
    filter,
    filteredRequests,
    filterItems,
    toasts,
    removeToast,
    confirmDialog,
    setFilter,
    handleApprove,
    handleReject,
    handleApproveAll,
  } = useParticipationRequestsPage();

  if (status === "loading" || loading) return <LoadingState />;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <h1 className={styles.title}>طلبات الانضمام</h1>

        <div className={styles.actions}>
          <Dropdown
            items={filterItems}
            active={filter}
            onChange={setFilter}
            placeholder="النشاط"
            compact
          />

          {filteredRequests.length > 0 && (
            <button className={styles.btnApproveAll} onClick={handleApproveAll}>
              <CheckCheck size={18} />
              قبول الكل ({filteredRequests.length})
            </button>
          )}
        </div>
      </header>

      {filteredRequests.length === 0 ? (
        <EmptyState icon={CheckCircle} message="لا توجد طلبات معلقة" />
      ) : (
        <div className={styles.list}>
          {filteredRequests.map((request) => (
            <ParticipationRequestItem
              key={request.id}
              request={request}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
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

export default ParticipationRequestsPage;