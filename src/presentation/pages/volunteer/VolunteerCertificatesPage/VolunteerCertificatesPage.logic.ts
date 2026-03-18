"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/presentation/hooks";
import { certificateApi } from "@/presentation/services";
import { UserRole } from "@/core/domain/enums";
import type { CertificateDto } from "@/core/application/dtos";

const ITEMS_PER_PAGE = 12;

export const useVolunteerCertificatesPage = () => {
  const { status }                               = useAuth({ requireRole: UserRole.VOLUNTEER });
  const [certificates, setCertificates]          = useState<CertificateDto[]>([]);
  const [totalHours,   setTotalHours]            = useState(0);
  const [loading,      setLoading]               = useState(true);
  const [activeFilter, setActiveFilter]          = useState("all");
  const [searchQuery,  setSearchQuery]           = useState("");
  const [appliedSearch, setAppliedSearch]        = useState("");
  const [currentPage,  setCurrentPage]           = useState(1);

  useEffect(() => { setCurrentPage(1); }, [activeFilter, appliedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await certificateApi.getByUser();
      if (res.success && res.data) {
        setCertificates(res.data.certificates ?? []);
        setTotalHours(res.data.totalHours ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    status, loading,
    certificates, totalHours,
    filtered, paginated,
    currentPage, setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    activeFilter, setActiveFilter,
    searchQuery, setSearchQuery,
    setAppliedSearch, appliedSearch,
  };
};