"use client";

import styles from "./VolunteerCertificatesPage.module.scss";
import { useVolunteerCertificatesPage } from "./VolunteerCertificatesPage.logic";
import { LoadingState, EmptyState, Search, Dropdown, Pagination } from "@/presentation/components";
import { CertificateCard } from "@/presentation/components";
import { Award } from "lucide-react";

const FILTER_OPTIONS = [
  { key: "all", label: "الكل" },
  { key: "IN_PERSON", label: "وجاهي" },
  { key: "ONLINE", label: "إلكتروني" }
];

const VolunteerCertificatesPage = () => {
  const {
    status, loading,
    certificates, totalHours,
    filtered, paginated,
    currentPage, setCurrentPage, itemsPerPage,
    activeFilter, setActiveFilter,
    searchQuery, setSearchQuery,
    setAppliedSearch, appliedSearch
  } = useVolunteerCertificatesPage();

  if (status === "loading" || loading) return <LoadingState />;

  return (
    <div className={styles.page}>
      <div className={styles.container}>














        <div className={styles.toolbar}>
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setAppliedSearch}
            placeholder="ابحث باسم النشاط..."
          />
          <Dropdown
            items={FILTER_OPTIONS}
            active={activeFilter}
            onChange={setActiveFilter}
            compact
          />
        </div>


        {filtered.length === 0 ? (
          <EmptyState
            icon={Award}
            message={
              appliedSearch
                ? "لا توجد نتائج مطابقة"
                : "لا توجد شهادات بعد "
            }
          />
        ) : (
          <>
            <div className={styles.grid}>
              {paginated.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
            {filtered.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                sticky
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerCertificatesPage;