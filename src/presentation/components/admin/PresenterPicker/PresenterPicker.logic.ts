"use client";

import { useMemo, useState } from "react";
import type { UserAnalyticsDto } from "@/core/application/dtos";

export const PRESENTER_PAGE_SIZE = 8;

export const usePresenterPicker = (volunteers: UserAnalyticsDto[]) => {
  const [query, setQuery] = useState("");
  const [appliedSearch, setAppliedSearchState] = useState("");
  const [page, setPage] = useState(1);

  const setAppliedSearch = (value: string) => {
    setAppliedSearchState(value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return volunteers;
    return volunteers.filter((v) => {
      const hours = String(v.stats?.totalHours ?? "");
      const city = (v.city ?? v.volunteerProfile?.city ?? "").toLowerCase();
      return (
        v.fullName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q) ||
        city.includes(q) ||
        hours.includes(q)
      );
    });
  }, [volunteers, appliedSearch]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PRESENTER_PAGE_SIZE));
  if (page > pageCount) setPage(pageCount);

  const paginated = useMemo(() => {
    const current = Math.min(page, pageCount);
    const start = (current - 1) * PRESENTER_PAGE_SIZE;
    return filtered.slice(start, start + PRESENTER_PAGE_SIZE);
  }, [filtered, page, pageCount]);

  return {
    query,
    setQuery,
    setAppliedSearch,
    appliedSearch,
    page: Math.min(page, pageCount),
    setPage,
    filtered,
    paginated
  };
};
