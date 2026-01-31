import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePaginationLogic } from "./Pagination.logic";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  sticky?: boolean;
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  sticky = false 
}: PaginationProps) => {
  const { pageNumbers, canGoPrevious, canGoNext, startIndex, endIndex } = usePaginationLogic(
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  );

  if (totalPages <= 1) return null;

  return (
    <div className={`${styles.container} ${sticky ? styles.sticky : ""}`}>
      <div className={styles.info}>
        عرض <span className={styles.highlight}>{startIndex}</span> - <span className={styles.highlight}>{endIndex}</span> من <span className={styles.highlight}>{totalItems}</span>
      </div>

      <div className={styles.pagination}>
        <button className={styles.navBtn} onClick={() => onPageChange(currentPage - 1)} disabled={!canGoPrevious}>
          <ChevronRight size={18} />
        </button>

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

        <button className={styles.navBtn} onClick={() => onPageChange(currentPage + 1)} disabled={!canGoNext}>
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;