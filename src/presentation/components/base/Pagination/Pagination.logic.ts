"use client";

import { useMemo } from "react";

export const usePaginationLogic = (
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  return {
    totalPages,
    pageNumbers,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    startIndex: totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, totalItems),
  };
};