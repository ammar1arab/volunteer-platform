"use client";

import { Users as UsersIcon } from "lucide-react";
import styles from "./UserManagementPage.module.scss";
import { useUserManagementPage } from "./UserManagementPage.logic";
import { 
  UserCard, 
  LoadingState, 
  EmptyState, 
  ToastContainer, 
  Pagination, 
  Dropdown,
  ExportUsersButton 
} from "@/presentation/components";

const SORT_OPTIONS = [
  { key: "most-active", label: "الأكثر نشاطاً"},
  { key: "oldest", label: "الأقدم"},
  { key: "newest", label: "الأحدث"},
  { key: "name", label: "الاسم"},
];

const EXPORT_COLUMNS = [
  { key: 'fullName', label: 'الاسم' },
  { key: 'age', label: 'العمر' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'city', label: 'المدينة' },
  { key: 'skills', label: 'المهارات' },
  // { key: 'interests', label: 'الاهتمامات' },
  { key: 'approvedActivities', label: 'عدد الأنشطة الموافق عليها' },
  { key: 'createdAt', label: 'تاريخ الانضمام' },
];

const UserManagementPage = () => {
  const {
    status,
    isLoading,
    volunteers,
    admins,
    paginatedVolunteers,
    volunteerPagination,
    sortBy,
    setSortBy,
    exportData,
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
                <div className={styles.headerLeft}>
                  <h2 className={styles.sectionTitle}>المتطوعين</h2>
                  <span className={styles.count}>{volunteers.length}</span>
                </div>
                
                <div className={styles.headerRight}>
                  <Dropdown
                    items={SORT_OPTIONS}
                    active={sortBy}
                    onChange={setSortBy}
                    placeholder="ترتيب حسب"
                    compact
                  />
                  
                  <ExportUsersButton
                    data={exportData}
                    columns={EXPORT_COLUMNS}
                    buttonText="Export"
                  />
                </div>
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
                <div className={styles.headerLeft}>
                  <h2 className={styles.sectionTitle}>Admins</h2>
                  <span className={styles.count}>{admins.length}</span>
                </div>
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