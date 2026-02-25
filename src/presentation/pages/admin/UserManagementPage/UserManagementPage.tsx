"use client";
import { Users as UsersIcon } from "lucide-react";
import { useMemo } from "react";
import styles from "./UserManagementPage.module.scss";
import { useUserManagementPage } from "./UserManagementPage.logic";
import {
  UserCard, LoadingState, EmptyState, ToastContainer,
  Pagination, Dropdown, ExportUsersButton, Search
} from "@/presentation/components";

const SORT_OPTIONS = [
  { key: "default",     label: "الافتراضي" },
  { key: "most-active", label: "الأكثر نشاطاً" },
  { key: "oldest",      label: "الأقدم" },
  { key: "newest",      label: "الأحدث" },
  { key: "name",        label: "الاسم" },
];

const EXPORT_COLUMNS = [
  { key: "fullName",           label: "الاسم" },
  { key: "age",                label: "العمر" },
  { key: "phone",              label: "رقم الهاتف" },
  { key: "email",              label: "البريد الإلكتروني" },
  { key: "city",               label: "المدينة" },
  { key: "skills",             label: "المهارات" },
  { key: "approvedActivities", label: "عدد الفرص الموافق عليها" },
  { key: "createdAt",          label: "تاريخ الانضمام" },
];

const ExportBtn = ({ data }: { data: any[] }) => (
  <ExportUsersButton data={data} columns={EXPORT_COLUMNS} buttonText="Export Excel" />
);

const UserManagementPage = () => {
  const {
    status, loading, volunteers, admins, paginatedVolunteers,
    currentPage, setCurrentPage, itemsPerPage, sortBy, setSortBy,
    exportData, toasts, removeToast,
    searchQuery, setSearchQuery, setAppliedSearch, appliedSearch,
  } = useUserManagementPage();

  const isEmpty = useMemo(
    () => volunteers.length === 0 && admins.length === 0,
    [volunteers.length, admins.length]
  );

  if (status === "loading") return <LoadingState />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {loading ? (
        <LoadingState />
      ) : isEmpty ? (
        <EmptyState icon={UsersIcon} message="لا يوجد مستخدمين" />
      ) : (
        <>
          {volunteers.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>

                <div className={styles.headerLeft}>
                  <div className={styles.titleGroup}>
                    <h2 className={styles.sectionTitle}>المتطوعين</h2>
                    <span className={styles.count}>{volunteers.length}</span>
                  </div>
                  <div className={styles.exportMobile}>
                    <ExportBtn data={exportData} />
                  </div>
                </div>

                <div className={styles.headerRight}>
                  <Search
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={setAppliedSearch}
                    placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                  />
                  <Dropdown
                    items={SORT_OPTIONS}
                    active={sortBy}
                    onChange={setSortBy}
                    placeholder="ترتيب حسب"
                    compact
                  />
                  <div className={styles.exportDesktop}>
                    <ExportBtn data={exportData} />
                  </div>
                </div>

              </div>

              {volunteers.length === 0 ? (
                <EmptyState
                  icon={UsersIcon}
                  message={appliedSearch ? "لا توجد نتائج للبحث" : "لا يوجد متطوعين"}
                />
              ) : (
                <>
                  <div className={styles.grid}>
                    {paginatedVolunteers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={volunteers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    sticky
                  />
                </>
              )}
            </section>
          )}

          {admins.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.headerLeft}>
                  <div className={styles.titleGroup}>
                    <h2 className={styles.sectionTitle}>Admins</h2>
                    <span className={styles.count}>{admins.length}</span>
                  </div>
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