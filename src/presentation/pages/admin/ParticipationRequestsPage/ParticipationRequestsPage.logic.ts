"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JordanianCity, UserRole } from "@/core/domain/enums";
import { useActivityParticipations, useToast, useAuth } from "@/presentation/hooks";
import { getCityLabel } from "@/presentation/constants";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  warning?: string;
};

export const useParticipationRequestsPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const { requests, loading, approve, reject } = useActivityParticipations({
    autoFetch: true,
    type: "pending"
  });

  const ITEMS_PER_PAGE = 20;
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmOptions(opts);
    setIsConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      setConfirmResolver(() => resolve);
    });
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

  const filteredRequests = useMemo(() => {
    let result = filter === "all" ? requests : requests.filter((r) => r.activityId === filter);
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.volunteer?.fullName?.toLowerCase().includes(q) ||
          r.volunteer?.email?.toLowerCase().includes(q) ||
          r.volunteer?.phone?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [requests, filter, appliedSearch]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  const filterItems = useMemo(() => {
    const activities = Array.from(new Set(requests.map((r) => r.activityId))).map((id) => {
      const request = requests.find((r) => r.activityId === id);
      return {
        key: id,
        label: request?.activity?.title || "نشاط",
        count: requests.filter((r) => r.activityId === id).length
      };
    });
    return [{ key: "all", label: "الكل", count: requests.length }, ...activities];
  }, [requests]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, appliedSearch]);

  const handleApprove = useCallback(
    async (id: string, volunteerName: string, volunteerCity?: string, activityCity?: string) => {
      const cityMismatch = volunteerCity && activityCity && volunteerCity !== activityCity;
      const ok = await confirm({
        title: "موافقة على الطلب",
        message: `هل تريد الموافقة على طلب ${volunteerName}؟`,
        confirmText: "موافقة",
        cancelText: "إلغاء",
        variant: "primary",
        warning: cityMismatch
          ? `تنبيه: المتطوع من ${getCityLabel(volunteerCity as JordanianCity)} والنشاط في ${getCityLabel(activityCity as JordanianCity)}`
          : undefined
      });
      if (!ok) return;
      const success = await approve(id);
      if (success) showToast("تمت الموافقة", "success");
    },
    [confirm, approve, showToast]
  );

  const handleReject = useCallback(
    async (id: string, volunteerName: string) => {
      const ok = await confirm({
        title: "رفض الطلب",
        message: `هل تريد رفض طلب ${volunteerName}؟`,
        confirmText: "رفض",
        cancelText: "إلغاء",
        variant: "danger"
      });
      if (!ok) return;
      const success = await reject(id);
      if (success) showToast("تم الرفض", "success");
    },
    [confirm, reject, showToast]
  );

  const handleApproveAll = useCallback(async () => {
    const count = filteredRequests.length;
    const ok = await confirm({
      title: "قبول جميع الطلبات",
      message: `هل تريد قبول جميع الطلبات (${count} طلب)؟`,
      confirmText: "قبول الكل",
      cancelText: "إلغاء",
      variant: "primary"
    });
    if (!ok) return;
    let successCount = 0;
    for (const request of filteredRequests) {
      const success = await approve(request.id);
      if (success) successCount++;
    }
    if (successCount > 0) showToast(`تمت الموافقة على ${successCount} من ${count} طلب`, "success");
  }, [filteredRequests, confirm, approve, showToast]);

  return {
    status,
    loading,
    filter,
    filteredRequests,
    paginatedRequests,
    filterItems,
    toasts,
    removeToast,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog
    },
    setFilter,
    handleApprove,
    handleReject,
    handleApproveAll
  };
};
