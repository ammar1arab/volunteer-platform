"use client";
import styles from "./MagazinesPublicPage.module.scss";
import { useMagazinesPublicPage } from "./MagazinesPublicPage.logic";
import { MagazineCard, LoadingState, EmptyState, Pagination, Search, Dropdown } from "@/presentation/components";
import { BookOpen } from "lucide-react";

const MagazinesPublicPage = () => {
  const {
    magazines, loading, currentPage, totalItems, itemsPerPage, setCurrentPage,
    searchQuery, setSearchQuery, setAppliedSearch,
    activeYear, setActiveYear, yearFilterOptions,
  } = useMagazinesPublicPage();

  if (loading) return <div className={styles.loadingContainer}><LoadingState /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>حصاد العطاء</h1>
        <p className={styles.subtitle}>نافذتكم على أرشيف كامل من المبادرات والتقارير الشهرية الموثقة</p>
      </header>

      <div className={styles.toolbar}>
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={setAppliedSearch}
          placeholder="ابحث عن مجلة..."
        />
        <Dropdown
          items={yearFilterOptions}
          active={activeYear}
          onChange={setActiveYear}
          placeholder="السنة"
          compact
        />
      </div>

      {magazines.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا توجد مجلات"
          message={searchQuery ? "لا توجد نتائج للبحث" : activeYear !== "all" ? "لا توجد مجلات لهذه السنة" : "لم يتم نشر أي إصدارات بعد"}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {magazines.map((m) => (
              <MagazineCard key={m.id} title={m.title} monthYear={m.monthYear} pdfUrl={m.pdfUrl} />
            ))}
          </div>
          {totalItems > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              sticky
            />
          )}
        </>
      )}
    </div>
  );
};

export default MagazinesPublicPage;