"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useToast, useActivityParticipations } from "@/presentation/hooks";
import { participationApi } from "@/presentation/services";
import { JordanianCity, UserRole, ParticipationStatus } from "@/core/domain/enums";
import { getCityLabel } from "@/presentation/constants";
import { getErrorMessage, unwrapResult } from "@/presentation/query";

const ITEMS_PER_PAGE = 10;

type SortOrder = "newest" | "oldest" | "nearest";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "primary";
};

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
  const { requests: participations, loading, refresh } = useActivityParticipations({
    autoFetch: true,
    type: "my-requests"
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [defaultApplied, setDefaultApplied] = useState(false);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeType, setActiveType] = useState<"all" | "ONLINE" | "IN_PERSON">("all");
  const [activeTime, setActiveTime] = useState<"all" | "upcoming" | "past">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
    confirmText: "",
    cancelText: "",
    variant: "danger"
  });
  const [confirmResolver, setConfirmResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmOptions(opts);
    setIsConfirmOpen(true);
    return new Promise<boolean>((resolve) => setConfirmResolver(() => resolve));
  }, []);

  const handleConfirmDialog = useCallback(() => {
    setIsConfirmOpen(false);
    confirmResolver?.(true);
    setConfirmResolver(null);
  }, [confirmResolver]);

  const handleCancelDialog = useCallback(() => {
    setIsConfirmOpen(false);
    confirmResolver?.(false);
    setConfirmResolver(null);
  }, [confirmResolver]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, appliedSearch, activeType, activeTime, sortOrder]);

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

  useEffect(() => {
    if (defaultApplied || loading || participations.length === 0) return;
    if (stats.pending > 0) setActiveFilter(ParticipationStatus.PENDING);
    else if (stats.approved > 0) setActiveFilter(ParticipationStatus.APPROVED);
    setDefaultApplied(true);
  }, [loading, participations.length, stats.pending, stats.approved, defaultApplied]);

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
      try {
        unwrapResult(await participationApi.create(activityId));
        showToast("تم إرسال طلب الانضمام مجدداً", "success");
        await refresh();
      } catch (err) {
        showToast(getErrorMessage(err, "فشل إرسال الطلب"), "error");
      } finally {
        setActionLoading(null);
      }
    },
    [refresh, showToast]
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
      try {
        unwrapResult(await participationApi.cancel(participationId));
        showToast("تم إلغاء الطلب", "success");
        await refresh();
      } catch (err) {
        const msg = getErrorMessage(err);
        showToast(
          msg.includes("24") || msg.includes("INVALID_STATE")
            ? "لا يمكن الإلغاء — تبقى أقل من 24 ساعة على موعد النشاط"
            : "لا يمكن إلغاء الطلب في الوقت الحالي",
          "error"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [confirm, refresh, showToast]
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
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog
    }
  };
};
