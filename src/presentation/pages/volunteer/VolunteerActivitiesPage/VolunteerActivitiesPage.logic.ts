"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useToast } from "@/presentation/hooks";
import { participationApi } from "@/presentation/services";
import { UserRole, ParticipationStatus } from "@/core/domain/enums";
import type { ActivityParticipationDto } from "@/core/application/dtos";

const ITEMS_PER_PAGE = 10;

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "primary";
};

export const useVolunteerActivitiesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.VOLUNTEER });
  const { toasts, showToast, removeToast } = useToast();
  const [participations, setParticipations] = useState<ActivityParticipationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Confirm dialog state ──
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
  }, [activeFilter, appliedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await participationApi.getMyRequests();
      if (res.success && res.data?.requests) {
        // console.log(res.data.requests[0]?.activity);
        setParticipations(res.data.requests);
      } else {
        setParticipations([]);
      }
    } catch {
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const filtered = useMemo(() => {
    let result = participations;

    if (activeFilter === "COMPLETED") {
      result = result.filter((p) => p.activity?.status === "COMPLETED");
    } else if (activeFilter === ParticipationStatus.CANCELLED) {
      result = result.filter((p) => p.status === ParticipationStatus.CANCELLED || p.activity?.status === "CANCELLED");
    } else if (activeFilter !== "all") {
      result = result.filter((p) => p.status === activeFilter);
    }

    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (p) => p.activity?.title?.toLowerCase().includes(q) || p.activity?.placeName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [participations, activeFilter, appliedSearch]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const reapply = useCallback(
    async (activityId: string) => {
      setActionLoading(activityId);
      try {
        const res = await participationApi.create(activityId);
        if (res.success) {
          showToast("تم إرسال طلب الانضمام مجدداً", "success");
          await fetchData();
        } else {
          showToast((res as any).error?.message || "فشل إرسال الطلب", "error");
        }
      } catch {
        showToast("حدث خطأ غير متوقع", "error");
      } finally {
        setActionLoading(null);
      }
    },
    [fetchData, showToast]
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
        const res = await participationApi.cancel(participationId);
        if (res.success) {
          showToast("تم إلغاء الطلب", "success");
          await fetchData();
        } else {
          const code = (res as any).error?.code ?? "";
          if (code === "INVALID_STATE") {
            showToast("لا يمكن الإلغاء — تبقى أقل من 24 ساعة على موعد النشاط", "warning");
          } else {
            showToast((res as any).error?.message || "فشل إلغاء الطلب", "error");
          }
        }
      } catch (err: any) {
        const msg = err?.message ?? "";
        if (msg.includes("24") || msg.includes("INVALID_STATE")) {
          showToast("لا يمكن الإلغاء — تبقى أقل من 24 ساعة على موعد النشاط", "warning");
        } else {
          showToast("لا يمكن إلغاء الطلب في الوقت الحالي", "error");
        }
      } finally {
        setActionLoading(null);
      }
    },
    [confirm, fetchData, showToast]
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
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    actionLoading,
    reapply,
    cancelRequest,
    toasts,
    removeToast,
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog
    }
  };
};
