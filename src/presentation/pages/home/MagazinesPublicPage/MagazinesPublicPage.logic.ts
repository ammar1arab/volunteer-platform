"use client";

import { useMemo } from "react";
import { useMonthlyMagazines } from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

const ITEMS_PER_PAGE = 20;

export const useMagazinesPublicPage = () => {
  const { list, loading } = useMonthlyMagazines({ activeOnly: true });

  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.public.magazines.currentPage",
    1
  );
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.public.magazines.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearch] = useSessionStorageState(
    "filters.public.magazines.appliedSearch",
    ""
  );
  const [activeYear, setActiveYear] = useSessionStorageState(
    "filters.public.magazines.year",
    "all"
  );

  const yearFilterOptions = useMemo(() => {
    const years = [...new Set(list.map(m => String(new Date(m.monthYear).getFullYear())))]
      .sort((a, b) => Number(b) - Number(a));
    return [{ key: "all", label: "الجميع" }, ...years.map(y => ({ key: y, label: y }))];
  }, [list]);

  const filtered = useMemo(() => {
    let result = list;
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(q));
    }
    if (activeYear !== "all") {
      result = result.filter(m => String(new Date(m.monthYear).getFullYear()) === activeYear);
    }
    return result;
  }, [list, appliedSearch, activeYear]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return {
    magazines: paginated,
    loading,
    currentPage,
    totalItems: filtered.length,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    activeYear,
    setActiveYear,
    yearFilterOptions,
  };
};