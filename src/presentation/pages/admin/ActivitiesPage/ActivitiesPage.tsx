"use client";
import styles from "./ActivitiesPage.module.scss";
import { useActivitiesPage, FILTERS, STATUS_MAP } from "./ActivitiesPage.logic";
import { LoadingState, EmptyState, ToastContainer, ActivityCard, Pagination, ActivityModal, VolunteersModal, ConfirmDialog, Dropdown } from "@/presentation/components";
import { Plus, Edit2, Trash2, CalendarDays, Clock, MapPin, Users, Send, Ban, UsersIcon, RotateCcw } from "lucide-react";

const ActivitiesPage = () => {
  const {
    status,
    loading,
    submitting,
    activeFilter,
    currentPage,
    itemsPerPage,
    mode,
    showModal,
    showVolunteersModal,
    selectedActivity,
    editData,
    filtered,
    paginatedActivities,
    toasts,
    removeToast,
    confirmDialog,
    setActiveFilter,
    setCurrentPage,
    setShowModal,
    setShowVolunteersModal,
    openCreateModal,
    handleEdit,
    handleImageUpload,
    handleModalSubmit,
    handleDelete,
    handlePublish,
    handleCancel,
    handleRestore,
    handleViewVolunteers,
  } = useActivitiesPage();

  if (status === "loading") return <LoadingState />;

  const filterItems = FILTERS.map(f => ({ key: f.key, label: f.label }));

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <h1 className={styles.title}>الفرص التطوعية</h1>
        <div className={styles.actions}>
          <Dropdown
            items={filterItems}
            active={activeFilter}
            onChange={setActiveFilter}
            placeholder="الحالة"
            compact
          />
          <button className={styles.btnCreate} onClick={openCreateModal}>
            <Plus size={18} />
            فرصة جديدة
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          message="لا توجد فرص"
          action={{ label: "إضافة فرصة", onClick: openCreateModal }}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedActivities.map((activity) => {
              const statusInfo = STATUS_MAP[activity.status as keyof typeof STATUS_MAP];
              return (
                <ActivityCard
                  key={activity.id}
                  imageUrl={activity.imageUrl}
                  title={activity.title}
                  description={activity.description}
                  meta={
                    <>
                      <div className={styles.metaRow}>
                        <span className={`${styles.status} ${styles[statusInfo.class]}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className={styles.metaRow}>
                        <CalendarDays size={14} />
                        <span>{new Date(activity.date).toISOString().slice(0, 10)}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <Clock size={14} />
                        <span>{activity.startTime} - {activity.endTime}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <MapPin size={14} />
                        <span>{activity.placeName}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <Users size={14} />
                        <span>{activity.currentVolunteers}/{activity.maxVolunteers}</span>
                      </div>
                    </>
                  }
                  actions={
                    <>
                      {activity.status === "DRAFT" && (
                        <>
                          <button className={styles.btn} onClick={() => handleEdit(activity)}>
                            <Edit2 size={14} />
                          </button>
                          <button className={styles.btnSuccess} onClick={() => handlePublish(activity)}>
                            <Send size={14} />
                          </button>
                        </>
                      )}
                      <button className={styles.btnInfo} onClick={() => handleViewVolunteers(activity)}>
                        <UsersIcon size={14} />
                        <span className={styles.badgeCount}>{activity.currentVolunteers}</span>
                      </button>
                      {activity.status === "CANCELLED" ? (
                        <button className={styles.btnRestore} onClick={() => handleRestore(activity)}>
                          <RotateCcw size={14} />
                        </button>
                      ) : (
                        <button className={styles.btnWarning} onClick={() => handleCancel(activity)}>
                          <Ban size={14} />
                        </button>
                      )}
                      <button className={styles.btnDanger} onClick={() => handleDelete(activity)}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            sticky
          />
        </>
      )}

      <ActivityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={mode}
        initialData={editData}
        onSubmit={handleModalSubmit}
        onImageUpload={handleImageUpload}
        isSubmitting={submitting}
      />

      <VolunteersModal
        activityId={selectedActivity?.id || ""}
        activityTitle={selectedActivity?.title || ""}
        isOpen={showVolunteersModal}
        onClose={() => setShowVolunteersModal(false)}
      />

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
    </>
  );
};

export default ActivitiesPage;