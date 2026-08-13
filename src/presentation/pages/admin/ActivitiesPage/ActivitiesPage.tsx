"use client";
import styles from "./ActivitiesPage.module.scss";
import { useActivitiesPage, FILTERS, STATUS_MAP } from "./ActivitiesPage.logic";

import { ActivityStatus, ActivityType } from "@/core/domain/enums";
import { LoadingState, EmptyState, ToastContainer, AdminActivityCard, Pagination, ActivityModal, VolunteersModal, ConfirmDialog, Dropdown, Search } from "@/presentation/components";
import { Plus, Edit2, Trash2, CalendarDays, Send, Ban, UsersIcon, RotateCcw } from "lucide-react";
import { getActivityTypeLabel } from "@/presentation/constants";

const ActivitiesPage = () => {
  const {
    status, loading, submitting, activeFilter, currentPage, itemsPerPage,
    mode, showModal, showVolunteersModal, selectedActivity, editData,
    filtered, paginatedActivities, toasts, removeToast, confirmDialog,
    setActiveFilter, setCurrentPage, setShowModal, setShowVolunteersModal,
    openCreateModal, handleEdit, handleImageUpload, handleModalSubmit,
    handleDelete, handlePublish, handleCancel, handleRestore, handleViewVolunteers,
    searchQuery, setSearchQuery, setAppliedSearch, appliedSearch, completeActivity
  } = useActivitiesPage();

  if (status === "loading") return <LoadingState />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div className={styles.actions}>
          <Search value={searchQuery} onChange={setSearchQuery} onSearch={setAppliedSearch} placeholder="ابحث عن فرصة..." />
          <div className={styles.actionsEnd}>
            <Dropdown
              items={FILTERS.map(f => ({ key: f.key, label: f.label }))}
              active={activeFilter}
              onChange={setActiveFilter}
              placeholder="تصفية حسب الحالة"
              compact
            />
            <button className={styles.btnCreate} onClick={openCreateModal}>
              <Plus size={18} /> إضافة فرصة جديدة
            </button>
          </div>
        </div>
      </header>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon={CalendarDays} message={appliedSearch ? "لا توجد نتائج للبحث" : "لم يتم العثور على أي فرص تطوعية"}
          action={{ label: "إضافة فرصة الآن", onClick: openCreateModal }} />
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedActivities.map((activity) => {
              const statusInfo = STATUS_MAP[activity.status as keyof typeof STATUS_MAP];
              return (
                <AdminActivityCard
                  key={activity.id}
                  activity={activity}
                  meta={
                    <span className={`${styles.status} ${styles[statusInfo.class]}`}>
                      {statusInfo.label}
                    </span>
                  }
                  actions={
                    <div className={styles.cardActions}>
                      {activity.status !== ActivityStatus.COMPLETED && (
                        <button className={styles.btn} title="تعديل" onClick={() => handleEdit(activity)}>
                          <Edit2 size={14} />
                        </button>
                      )}

                      {activity.status === ActivityStatus.DRAFT && (
                        <button className={styles.btnSuccess} title="نشر" onClick={() => handlePublish(activity)}>
                          <Send size={14} />
                        </button>
                      )}

                      <button className={styles.btnInfo} title="عرض المتطوعين" onClick={() => handleViewVolunteers(activity)}>
                        <UsersIcon size={14} />
                        <span className={styles.badgeCount}>{activity.currentVolunteers}</span>
                      </button>

                      {activity.status === ActivityStatus.CANCELLED ? (
                        <button className={styles.btnRestore} title="استعادة" onClick={() => handleRestore(activity)}>
                          <RotateCcw size={14} />
                        </button>
                      ) : activity.status !== ActivityStatus.COMPLETED && (
                        <button className={styles.btnWarning} title="إلغاء الفرصة" onClick={() => handleCancel(activity)}>
                          <Ban size={14} />
                        </button>
                      )}

                      <button className={styles.btnDanger} title="حذف" onClick={() => handleDelete(activity)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  }
                />
              );
            })}
          </div>

          <Pagination currentPage={currentPage} totalItems={filtered.length}
            itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} sticky />
        </>
      )}

      <ActivityModal
        key={showModal ? (editData?.id ?? "create") : "activity-closed"}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={mode} initialData={editData} onSubmit={handleModalSubmit}
        onImageUpload={handleImageUpload} isSubmitting={submitting} />

      <VolunteersModal
        key={showVolunteersModal ? selectedActivity?.id ?? "none" : "volunteers-closed"}
        activityId={selectedActivity?.id || ""}
        activityTitle={selectedActivity?.title || ""}
        activityStatus={selectedActivity?.status || ""}
        activityDate={selectedActivity ? new Date(selectedActivity.date).toLocaleDateString("ar-JO") : ""}
        activityType={selectedActivity ? getActivityTypeLabel(selectedActivity.activityType as ActivityType) : ""}
        durationHours={selectedActivity?.durationHours ?? 0}
        isOpen={showVolunteersModal}
        onClose={() => setShowVolunteersModal(false)}
        onComplete={selectedActivity ? () => completeActivity(selectedActivity.id) : undefined}
      />

      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm} title={confirmDialog.options.title}
        message={confirmDialog.options.message} confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText} variant={confirmDialog.options.variant} />
    </>
  );
};

export default ActivitiesPage;