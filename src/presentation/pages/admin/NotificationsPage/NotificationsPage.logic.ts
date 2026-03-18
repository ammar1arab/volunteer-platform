"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useToast } from "@/presentation/hooks";
import type { BroadcastDto, PreviewUserDto, SendCustomNotificationInput } from "@/core/application/dtos";
import { notificationApi } from "@/presentation/services";
import { CITY_OPTIONS, GENDER_OPTIONS } from "@/presentation/constants";
import { relativeTime } from "@/lib/utils";

type Target = "ALL" | "CITY" | "GENDER";
type SubmitStatus = "idle" | "loading";

const EMPTY_FORM: SendCustomNotificationInput = {
  title: "",
  message: "",
  target: "ALL",
  targetValue: "",
  link: ""
};

export const TARGET_OPTIONS = [
  { value: "ALL", label: "جميع المتطوعين" },
  { value: "CITY", label: "حسب المدينة" },
  { value: "GENDER", label: "حسب الجنس" }
];

export { CITY_OPTIONS, GENDER_OPTIONS, relativeTime };

export function useNotificationsPageLogic() {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();

  const [form, setForm] = useState<SendCustomNotificationInput>(EMPTY_FORM);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [broadcasts, setBroadcasts] = useState<BroadcastDto[]>([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(true);

  const [previewUsers, setPreviewUsers] = useState<PreviewUserDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearingBroadcasts, setClearingBroadcasts] = useState(false);

  const handleClearBroadcasts = useCallback(async () => {
    setClearingBroadcasts(true);
    try {
      await notificationApi.clearBroadcasts();
      setBroadcasts([]);
      showToast("تم مسح السجل بنجاح", "success");
    } catch {
      showToast("حدث خطأ أثناء المسح", "error");
    } finally {
      setClearingBroadcasts(false);
    }
  }, [showToast]);

  const fetchBroadcasts = useCallback(async () => {
    setLoadingBroadcasts(true);
    try {
      const res = await notificationApi.getBroadcasts();
      const data = (res as { data?: { broadcasts?: BroadcastDto[] } })?.data?.broadcasts ?? [];
      setBroadcasts(data);
    } finally {
      setLoadingBroadcasts(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const setField = useCallback((name: string, value: string) => {
    setForm((p) => ({
      ...p,
      [name]: value,
      ...(name === "target" ? { targetValue: "" } : {})
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim() || !form.message.trim()) return;
      if ((form.target === "CITY" || form.target === "GENDER") && !form.targetValue) return;

      setLoadingPreview(true);
      try {
        const res = await notificationApi.previewTargets(form.target as Target, form.targetValue || undefined);
        const users = (res as { data?: { users?: PreviewUserDto[] } })?.data?.users ?? [];
        if (!users.length) {
          showToast("لا يوجد متطوعون يطابقون هذا الاستهداف", "error");
          return;
        }
        setPreviewUsers(users);
        setSelectedIds(new Set(users.map((u) => u.id)));
        setShowPreview(true);
      } catch {
        showToast("حدث خطأ أثناء جلب البيانات", "error");
      } finally {
        setLoadingPreview(false);
      }
    },
    [form, showToast]
  );

  const toggleUser = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => (prev.size === previewUsers.length ? new Set() : new Set(previewUsers.map((u) => u.id))));
  }, [previewUsers]);

  const handleSendConfirmed = useCallback(async () => {
    setShowConfirm(false);
    setSubmitStatus("loading");
    try {
      const res = await notificationApi.sendCustom({
        title: form.title.trim(),
        message: form.message.trim(),
        target: form.target as Target,
        targetValue: form.targetValue || undefined,
        link: form.link?.trim() || undefined,
        userIds: [...selectedIds]
      });
      const sent = (res as { data?: { sent?: number } })?.data?.sent ?? 0;
      showToast(`تم إرسال الإشعار لـ ${sent} متطوع`, "success");
      setForm(EMPTY_FORM);
      setShowPreview(false);
      setPreviewUsers([]);
      setSelectedIds(new Set());
      fetchBroadcasts();
    } catch {
      showToast("حدث خطأ أثناء الإرسال", "error");
    } finally {
      setSubmitStatus("idle");
    }
  }, [form, selectedIds, fetchBroadcasts, showToast]);

  const closePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewUsers([]);
    setSelectedIds(new Set());
  }, []);

  return {
    status,
    form,
    submitStatus,
    loadingPreview,
    broadcasts,
    loadingBroadcasts,
    toasts,
    removeToast,
    previewUsers,
    selectedIds,
    showPreview,
    showConfirm,
    setField,
    handleSubmit,
    toggleUser,
    toggleAll,
    setShowConfirm,
    handleSendConfirmed,
    closePreview,
    clearingBroadcasts,
    handleClearBroadcasts
  };
}
