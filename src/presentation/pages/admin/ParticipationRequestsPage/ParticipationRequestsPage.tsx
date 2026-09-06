"use client";
import styles from "./ParticipationRequestsPage.module.scss";
import { useParticipationRequestsPage } from "./ParticipationRequestsPage.logic";
import { useRouter } from "next/navigation";
import {
  LoadingState, EmptyState, ToastContainer, ConfirmDialog,
  ParticipationRequestItem, Dropdown, Search, Pagination, ExportUsersButton,
} from "@/presentation/components";
import { ROUTES } from "@/presentation/constants";
import { CheckCircle, CheckCheck } from "lucide-react";

const EXPORT_COLUMNS = [
  { key: "fullName", label: "الاسم" },
  { key: "email", label: "البريد الإلكتروني" },
  { key: "phone", label: "رقم الهاتف" },
  { key: "city", label: "المدينة" },
  { key: "activityTitle", label: "النشاط" },
  { key: "activityDate", label: "تاريخ النشاط" },
];

const ParticipationRequestsPage = () => {
  const router = useRouter();
  const {
    status, loading, filter, filteredRequests, paginatedRequests,
    filterItems, exportData, toasts, removeToast, confirmDialog,
    searchQuery, setSearchQuery, setAppliedSearch, appliedSearch,
    currentPage, setCurrentPage, itemsPerPage,
    setFilter, handleApprove, handleReject, handleApproveAll,
  } = useParticipationRequestsPage();

  if (status === "loading" || loading) return <LoadingState />;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div className={styles.actions}>
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setAppliedSearch}
            placeholder="ابحث بالاسم أو البريد أو الهاتف..."
          />
          <div className={styles.actionsEnd}>
            <Dropdown
              items={filterItems}
              active={filter}
              onChange={setFilter}
              placeholder="النشاط"
              compact
            />
            <ExportUsersButton data={exportData} columns={EXPORT_COLUMNS} buttonText="Export" />
            <button
              className={styles.btnApproveAll}
              onClick={handleApproveAll}
              disabled={filteredRequests.length === 0}
            >
              <CheckCheck size={18} />
              قبول الكل ({filteredRequests.length})
            </button>
          </div>
        </div>
      </header>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          message={appliedSearch ? "لا توجد نتائج للبحث" : "لا توجد طلبات معلقة"}
        />
      ) : (
        <>
          <div className={styles.list}>
            {paginatedRequests.map((request) => (
              <ParticipationRequestItem
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onVolunteerClick={(volunteerId) => router.push(ROUTES.ADMIN.USER_DETAILS(volunteerId))}
              />
            ))}
          </div>

          {filteredRequests.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredRequests.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              sticky
            />
          )}
        </>
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
        warning={confirmDialog.options.warning}
      />
    </div>
  );
};

export default ParticipationRequestsPage;
