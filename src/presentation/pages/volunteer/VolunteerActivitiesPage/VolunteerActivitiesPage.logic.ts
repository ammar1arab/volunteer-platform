"use client";

import { useCallback, useMemo, useState } from "react";
import { useAuth, useToast, useActivityParticipations, useConfirmDialog } from "@/presentation/hooks";
import { JordanianCity, UserRole, ParticipationStatus } from "@/core/domain/enums";
import { getCityLabel } from "@/presentation/constants";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

const ITEMS_PER_PAGE = 10;
const ACTIVE_FILTER_STORAGE_KEY = "filters.volunteer.activities.activeFilter";

type SortOrder = "newest" | "oldest" | "nearest";

export const SORT_OPTIONS = [
  { key: "newest", label: "الأحدث" },
  { key: "oldest", label: "الأقدم" },
  { key: "nearest", label: "الأقرب" },
  { key: "IN_PERSON", label: "وجاهي" },
  { key: "ONLINE", label: "إلكتروني" }
] as const;

export const useVolunteerActivitiesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.VOLUNTEER });
  const { toasts, showToast, removeToast } = useToast();
  const { requests: participations, loading, createRequest, cancelRequest: cancelParticipation } = useActivityParticipations({
    autoFetch: true,
    type: "my-requests"
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [storedFilter, setActiveFilterState] = useSessionStorageState<string | null>(
    ACTIVE_FILTER_STORAGE_KEY,
    null
  );
  const [activeType, setActiveTypeState] = useSessionStorageState<"all" | "ONLINE" | "IN_PERSON">(
    "filters.volunteer.activities.activeType",
    "all"
  );
  const [activeTime, setActiveTimeState] = useSessionStorageState<"all" | "upcoming" | "past">(
    "filters.volunteer.activities.activeTime",
    "all"
  );
  const [sortOrder, setSortOrderState] = useSessionStorageState<SortOrder>(
    "filters.volunteer.activities.sortOrder",
    "newest"
  );

  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.volunteer.activities.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearchState] = useSessionStorageState(
    "filters.volunteer.activities.appliedSearch",
    ""
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.volunteer.activities.currentPage",
    1
  );
  const { confirm, confirmDialog } = useConfirmDialog();

  const setStoredFilter = useCallback((value: string | ((prev: string | null) => string | null)) => {
    setActiveFilterState(value as string | null);
    setCurrentPage(1);
  }, [setActiveFilterState, setCurrentPage]);

  const setActiveType: typeof setActiveTypeState = useCallback((value) => {
    setActiveTypeState(value);
    setCurrentPage(1);
  }, [setActiveTypeState, setCurrentPage]);

  const setActiveTime: typeof setActiveTimeState = useCallback((value) => {
    setActiveTimeState(value);
    setCurrentPage(1);
  }, [setActiveTimeState, setCurrentPage]);

  const setSortOrder: typeof setSortOrderState = useCallback((value) => {
    setSortOrderState(value);
    setCurrentPage(1);
  }, [setSortOrderState, setCurrentPage]);

  const setAppliedSearch: typeof setAppliedSearchState = useCallback((value) => {
    setAppliedSearchState(value);
    setCurrentPage(1);
  }, [setAppliedSearchState, setCurrentPage]);

  const stats = useMemo(
    () => ({
      total: participations.length,
      completed: participations.filter((p) => p.activity?.status === "COMPLETED").length,
      approved: participations.filter((p) => p.status === ParticipationStatus.APPROVED).length,
      pending: participations.filter((p) => p.status === ParticipationStatus.PENDING).length,
      rejected: participations.filter((p) => p.status === ParticipationStatus.REJECTED).length,
      cancelled: participations.filter((p) => p.status === ParticipationStatus.CANCELLED).length
    }),
    [participations]
  );

  const activeFilter = storedFilter ?? (
    stats.pending > 0
      ? ParticipationStatus.PENDING
      : stats.approved > 0
        ? ParticipationStatus.APPROVED
        : "all"
  );

  const setActiveFilter = useCallback((value: string | ((prev: string) => string)) => {
    const next = typeof value === "function" ? value(activeFilter) : value;
    setStoredFilter(next);
  }, [activeFilter, setStoredFilter]);

  const filtered = useMemo(() => {
    let result = participations;

    if (activeFilter === "COMPLETED") {
      result = result.filter((p) => p.activity?.status === "COMPLETED");
    } else if (activeFilter === ParticipationStatus.CANCELLED) {
      result = result.filter((p) => p.status === ParticipationStatus.CANCELLED || p.activity?.status === "CANCELLED");
    } else if (activeFilter !== "all") {
      result = result.filter((p) => p.status === activeFilter);
    }

    if (activeType !== "all") {
      result = result.filter((p) => p.activity?.activityType === activeType);
    }

    const now = new Date();
    if (activeTime === "upcoming") {
      result = result.filter((p) => (p.activity?.date ? new Date(p.activity.date) >= now : false));
    } else if (activeTime === "past") {
      result = result.filter((p) => (p.activity?.date ? new Date(p.activity.date) < now : false));
    }

    if (appliedSearch.trim()) {
      const q = appliedSearch.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.activity?.title?.toLowerCase().includes(q) ||
          p.activity?.description?.toLowerCase().includes(q) ||
          p.activity?.placeName?.toLowerCase().includes(q) ||
          (p.activity?.city &&
            getCityLabel(p.activity.city as JordanianCity)
              .toLowerCase()
              .includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
      }
      if (sortOrder === "nearest") {
        const nowMs = Date.now();
        const aT = a.activity?.date ? Math.abs(new Date(a.activity.date).getTime() - nowMs) : Infinity;
        const bT = b.activity?.date ? Math.abs(new Date(b.activity.date).getTime() - nowMs) : Infinity;
        return aT - bT;
      }
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });
  }, [participations, activeFilter, activeType, activeTime, appliedSearch, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleSortChange = useCallback((key: string) => {
    if (key === "IN_PERSON" || key === "ONLINE") {
      setActiveType((prev) => (prev === key ? "all" : key));
    } else {
      setSortOrder(key as SortOrder);
    }
  }, []);

  const reapply = useCallback(
    async (activityId: string) => {
      setActionLoading(activityId);
      const ok = await createRequest(activityId);
      if (ok) showToast("تم إرسال طلب الانضمام مجدداً", "success");
      else showToast("فشل إرسال الطلب", "error");
      setActionLoading(null);
    },
    [createRequest, showToast]
  );

  const cancelRequest = useCallback(
    async (participationId: string) => {
      const ok = await confirm({
        title: "إلغاء الانضمام",
        message:
          "نفهم أن الظروف قد تتغير، لكن تذكّر أن انسحابك قد يؤثر على اكتمال هذه الفرصة التطوعية. نرجو أن يكون ذلك لظرف طارئ فقط.",
        confirmText: "إلغاء انضمامي",
        cancelText: "البقاء في الفرصة",
        variant: "danger"
      });
      if (!ok) return;

      setActionLoading(participationId);
      const success = await cancelParticipation(participationId);
      if (success) showToast("تم إلغاء الطلب", "success");
      else showToast("لا يمكن إلغاء الطلب في الوقت الحالي", "error");
      setActionLoading(null);
    },
    [confirm, cancelParticipation, showToast]
  );

  return {
    status,
    loading,
    stats,
    filtered,
    paginated,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    activeFilter,
    setActiveFilter,
    activeType,
    setActiveType,
    activeTime,
    setActiveTime,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    actionLoading,
    reapply,
    cancelRequest,
    toasts,
    handleSortChange,
    removeToast,
    confirmDialog
  };
};
