"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useCertificates } from "@/presentation/hooks";
import { UserRole } from "@/core/domain/enums";

const ITEMS_PER_PAGE = 12;

export const useVolunteerCertificatesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.VOLUNTEER });
  const { list: certificates, totalHours, loading } = useCertificates();

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, appliedSearch]);

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
