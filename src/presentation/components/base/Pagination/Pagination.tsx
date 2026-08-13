"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGINATION_LABELS } from "@/presentation/constants";
import { usePaginationLogic } from "./Pagination.logic";
import styles from "./Pagination.module.scss";

type Props = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  sticky?: boolean;
  compact?: boolean;
};

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  sticky = false,
  compact = false
}: Props) => {
  const {
    pageItems,
    canGoPrevious,
    canGoNext,
    startIndex,
    endIndex,
    totalPages,
    safePage
  } = usePaginationLogic(currentPage, totalItems, itemsPerPage);

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === safePage) return;
    onPageChange(page);
  };

  return (
    <nav
      className={`${styles.container} ${compact ? styles.compact : ""} ${sticky ? styles.sticky : ""}`}
      aria-label={PAGINATION_LABELS.pageOf(safePage, totalPages)}
    >
      <p className={styles.info}>{PAGINATION_LABELS.showing(startIndex, endIndex, totalItems)}</p>

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(safePage - 1)}
          disabled={!canGoPrevious}
          aria-label={PAGINATION_LABELS.previous}
        >
          <ChevronRight size={16} />
        </button>

        {compact ? (
          <span className={styles.pageStatus}>{PAGINATION_LABELS.pageOf(safePage, totalPages)}</span>
        ) : (
          pageItems.map((item) =>
            item.kind === "gap" ? (
              <span key={item.id} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                type="button"
                key={item.value}
                className={`${styles.pageBtn} ${item.value === safePage ? styles.active : ""}`}
                onClick={() => goTo(item.value)}
                aria-current={item.value === safePage ? "page" : undefined}
              >
                {item.value}
              </button>
            )
          )
        )}

        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goTo(safePage + 1)}
          disabled={!canGoNext}
          aria-label={PAGINATION_LABELS.next}
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
