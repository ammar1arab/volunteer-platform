"use client";

import { Users as UsersIcon } from "lucide-react";
import styles from "./UserManagementPage.module.scss";
import { useUserManagementPage } from "./UserManagementPage.logic";
import { UserCard, LoadingState, EmptyState, ToastContainer, Pagination } from "@/presentation/components";

const UserManagementPage = () => {
  const {
    status,
    isLoading,
    volunteers,
    admins,
    paginatedVolunteers,
    volunteerPagination,
    toasts,
    removeToast,
  } = useUserManagementPage();

  if (status === "loading") return <LoadingState />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {isLoading ? (
        <LoadingState />
      ) : volunteers.length === 0 && admins.length === 0 ? (
        <EmptyState icon={UsersIcon} message="لا يوجد مستخدمين" />
      ) : (
        <>
          {volunteers.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>المتطوعين</h2>
                <span className={styles.count}>{volunteers.length}</span>
              </div>
              <div className={styles.grid}>
                {paginatedVolunteers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
              {volunteerPagination.totalPages > 1 && (
                <Pagination
                  currentPage={volunteerPagination.currentPage}
                  totalPages={volunteerPagination.totalPages}
                  totalItems={volunteers.length}
                  itemsPerPage={20}
                  onPageChange={volunteerPagination.goToPage}
                  sticky
                />
              )}
            </section>
          )}

          {admins.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Admins</h2>
                <span className={styles.count}>{admins.length}</span>
              </div>
              <div className={styles.grid}>
                {admins.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
};

export default UserManagementPage;