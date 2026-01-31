"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib";
import { useActivityParticipations, useToast } from "@/presentation/hooks";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

export const useParticipationRequestsPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { requests, loading, approve, reject } = useActivityParticipations({
    autoFetch: true,
    type: "pending",
  });

  const [filter, setFilter] = useState<string>("all");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const role = session?.user?.role ?? "VOLUNTEER";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.LOGIN);
    if (role !== "ADMIN") router.replace(ROUTES.VOLUNTEER.PROFILE);
  }, [status, role, router]);

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
    if (filter === "all") return requests;
    return requests.filter((r) => r.activityId === filter);
  }, [requests, filter]);

  const filterItems = useMemo(() => {
    const activities = Array.from(new Set(requests.map((r) => r.activityId))).map((id) => {
      const request = requests.find((r) => r.activityId === id);
      return {
        key: id,
        label: request?.activity?.title || "نشاط",
        count: requests.filter((r) => r.activityId === id).length,
      };
    });

    return [
      { key: "all", label: "الكل", count: requests.length },
      ...activities,
    ];
  }, [requests]);

  const handleApprove = useCallback(
    async (id: string, volunteerName: string) => {
      const ok = await confirm({
        title: "موافقة على الطلب",
        message: `هل تريد الموافقة على طلب ${volunteerName}؟`,
        confirmText: "موافقة",
        cancelText: "إلغاء",
        variant: "primary",
      });

      if (!ok) return;

      const success = await approve(id);
      if (success) {
        showToast("تمت الموافقة", "success");
      }
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
        variant: "danger",
      });

      if (!ok) return;

      const success = await reject(id);
      if (success) {
        showToast("تم الرفض", "success");
      }
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
      variant: "primary",
    });

    if (!ok) return;

    let successCount = 0;
    for (const request of filteredRequests) {
      const success = await approve(request.id);
      if (success) successCount++;
    }

    if (successCount > 0) {
      showToast(`تمت الموافقة على ${successCount} من ${count} طلب`, "success");
    }
  }, [filteredRequests, confirm, approve, showToast]);

  return {
    status,
    loading,
    filter,
    filteredRequests,
    filterItems,
    toasts,
    removeToast,
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog,
    },
    setFilter,
    handleApprove,
    handleReject,
    handleApproveAll,
  };
};