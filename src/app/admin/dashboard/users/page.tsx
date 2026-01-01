"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users as UsersIcon } from "lucide-react";
import styles from "./page.module.scss";
import { ROUTES } from "@/lib";
import { useUsers, useToast, usePagination } from "@/presentation/hooks";
import { UserCard, LoadingState, EmptyState, ToastContainer, Pagination } from "@/presentation/components";

const UsersPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { users, isLoading, error } = useUsers();

  const role = session?.user?.role ?? "VOLUNTEER";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (role !== "ADMIN") {
      router.replace(ROUTES.VOLUNTEER.PROFILE);
    }
  }, [status, role, router]);

  useEffect(() => {
    if (error && error.trim()) {
      showToast(error, "error");
    }
  }, [error, showToast]);

  const volunteers = users.filter((u) => u.role === "VOLUNTEER");
  const admins = users.filter((u) => u.role === "ADMIN");

  // Pagination for volunteers
  const volunteerPagination = usePagination({
    totalItems: volunteers.length,
    itemsPerPage: 10,
  });

  // Pagination for admins
  const adminPagination = usePagination({
    totalItems: admins.length,
    itemsPerPage: 10,
  });

  const paginatedVolunteers = volunteerPagination.paginateItems(volunteers);
  const paginatedAdmins = adminPagination.paginateItems(admins);

  if (status === "loading") {
    return <LoadingState message="جاري التحميل..." />;
  }

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div>
            <p className={styles.subtitle}>
              {volunteers.length} متطوع • {admins.length} مدير • {users.length} إجمالي
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <LoadingState variant="skeleton" count={6} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} message="لا يوجد مستخدمين" />
      ) : (
        <>
          {volunteers.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>المتطوعين</h2>
                <span className={styles.count}>{volunteers.length}</span>
              </div>
              <div className={styles.list}>
                {paginatedVolunteers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
              <Pagination
                currentPage={volunteerPagination.currentPage}
                totalPages={volunteerPagination.totalPages}
                onPageChange={volunteerPagination.goToPage}
                onPrevious={volunteerPagination.goToPrevious}
                onNext={volunteerPagination.goToNext}
                onFirst={volunteerPagination.goToFirst}
                onLast={volunteerPagination.goToLast}
                canGoPrevious={volunteerPagination.canGoPrevious}
                canGoNext={volunteerPagination.canGoNext}
                showInfo={true}
                startIndex={volunteerPagination.startIndex}
                endIndex={volunteerPagination.endIndex}
                totalItems={volunteers.length}
              />
            </section>
          )}

          {admins.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>المديرين</h2>
                <span className={styles.count}>{admins.length}</span>
              </div>
              <div className={styles.list}>
                {paginatedAdmins.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
              <Pagination
                currentPage={adminPagination.currentPage}
                totalPages={adminPagination.totalPages}
                onPageChange={adminPagination.goToPage}
                onPrevious={adminPagination.goToPrevious}
                onNext={adminPagination.goToNext}
                onFirst={adminPagination.goToFirst}
                onLast={adminPagination.goToLast}
                canGoPrevious={adminPagination.canGoPrevious}
                canGoNext={adminPagination.canGoNext}
                showInfo={true}
                startIndex={adminPagination.startIndex}
                endIndex={adminPagination.endIndex}
                totalItems={admins.length}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default UsersPage;