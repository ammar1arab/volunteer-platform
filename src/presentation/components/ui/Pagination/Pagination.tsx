import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  showInfo?: boolean;
  startIndex?: number;
  endIndex?: number;
  totalItems?: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  canGoPrevious,
  canGoNext,
  showInfo = true,
  startIndex = 0,
  endIndex = 0,
  totalItems = 0,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.container}>
      {showInfo && totalItems > 0 && (
        <div className={styles.info}>
          عرض <span className={styles.highlight}>{startIndex + 1}</span> إلى{" "}
          <span className={styles.highlight}>{endIndex}</span> من{" "}
          <span className={styles.highlight}>{totalItems}</span> عنصر
        </div>
      )}

      <div className={styles.pagination}>
        <button
          className={styles.navBtn}
          onClick={onFirst}
          disabled={!canGoPrevious}
          title="الصفحة الأولى"
        >
          <ChevronsRight size={18} />
        </button>

        <button
          className={styles.navBtn}
          onClick={onPrevious}
          disabled={!canGoPrevious}
          title="السابق"
        >
          <ChevronRight size={18} />
        </button>

        <div className={styles.pages}>
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === currentPage ? styles.active : ""}`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          className={styles.navBtn}
          onClick={onNext}
          disabled={!canGoNext}
          title="التالي"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          className={styles.navBtn}
          onClick={onLast}
          disabled={!canGoNext}
          title="الصفحة الأخيرة"
        >
          <ChevronsLeft size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;