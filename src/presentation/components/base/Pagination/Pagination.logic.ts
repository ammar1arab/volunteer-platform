"use client";

import { useMemo } from "react";

const SIMPLE_PAGE_LIMIT = 7;
const SIBLING_COUNT = 1;

export type PaginationItem =
  | { kind: "page"; value: number }
  | { kind: "gap"; id: string };

const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);

export const usePaginationLogic = (
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const pageItems = useMemo((): PaginationItem[] => {
    if (totalPages <= SIMPLE_PAGE_LIMIT) {
      return range(1, totalPages).map((value) => ({ kind: "page" as const, value }));
    }

    const items: PaginationItem[] = [{ kind: "page", value: 1 }];
    const left = Math.max(2, safePage - SIBLING_COUNT);
    const right = Math.min(totalPages - 1, safePage + SIBLING_COUNT);

    if (left > 2) items.push({ kind: "gap", id: "start" });
    range(left, right).forEach((value) => items.push({ kind: "page", value }));
    if (right < totalPages - 1) items.push({ kind: "gap", id: "end" });
    items.push({ kind: "page", value: totalPages });

    return items;
  }, [safePage, totalPages]);

  return {
    totalPages,
    pageItems,
    canGoPrevious: safePage > 1,
    canGoNext: safePage < totalPages,
    startIndex: totalItems === 0 ? 0 : (safePage - 1) * itemsPerPage + 1,
    endIndex: Math.min(safePage * itemsPerPage, totalItems),
    safePage
  };
};
