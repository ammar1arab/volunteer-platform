"use client";

import { useCallback, useMemo } from "react";
import { useAuth, useCertificates } from "@/presentation/hooks";
import { UserRole } from "@/core/domain/enums";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

const ITEMS_PER_PAGE = 12;

export const useVolunteerCertificatesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.VOLUNTEER });
  const { list: certificates, totalHours, loading } = useCertificates();

  const [activeFilter, setActiveFilterState] = useSessionStorageState(
    "filters.volunteer.certificates.activeFilter",
    "all"
  );
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.volunteer.certificates.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearchState] = useSessionStorageState(
    "filters.volunteer.certificates.appliedSearch",
    ""
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.volunteer.certificates.currentPage",
    1
  );

  const setActiveFilter: typeof setActiveFilterState = useCallback((value) => {
    setActiveFilterState(value);
    setCurrentPage(1);
  }, [setActiveFilterState, setCurrentPage]);

  const setAppliedSearch: typeof setAppliedSearchState = useCallback((value) => {
    setAppliedSearchState(value);
    setCurrentPage(1);
  }, [setAppliedSearchState, setCurrentPage]);

  const filtered = useMemo(() => {
    let result = certificates;
    if (activeFilter !== "all") result = result.filter((c) => c.activityType === activeFilter);
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter((c) => c.activityTitle?.toLowerCase().includes(q));
    }
    return result;
  }, [certificates, activeFilter, appliedSearch]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return {
    status,
    loading,
    certificates,
    totalHours,
    filtered,
    paginated,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch
  };
};
