"use client";

import { useState, useCallback, useMemo } from "react";
import { UserRole, audienceTargetNeedsValue } from "@/core/domain/enums";
import { useAuth, useToast } from "@/presentation/hooks";
import type {
  BroadcastDto,
  BroadcastRecipientDto,
  PreviewUserDto,
  SendCustomNotificationInput
} from "@/core/application/dtos";
import { notificationApi } from "@/presentation/services";
import { relativeTime } from "@/lib/utils";
import {
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useFetchData
} from "@/presentation/query";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import { useAudienceTargetFields } from "@/presentation/hooks/useAudienceTargetFields";

type SubmitStatus = "idle" | "loading";

const EMPTY_FORM: SendCustomNotificationInput = {
  title: "",
  message: "",
  target: "ALL",
  targetValue: "",
  link: ""
};

const BROADCASTS_PER_PAGE = 5;

export { relativeTime };

interface RecipientsState {
  open: boolean;
  broadcastId: string | null;
  title: string;
  recipients: BroadcastRecipientDto[];
  loading: boolean;
}

const INITIAL_RECIPIENTS: RecipientsState = {
  open: false,
  broadcastId: null,
  title: "",
  recipients: [],
  loading: false
};

export function useNotificationsPageLogic() {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();

  const [form, setFormState] = useState<SendCustomNotificationInput>(EMPTY_FORM);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [broadcastsPage, setBroadcastsPage] = useSessionStorageState(
    "filters.admin.notifications.broadcastsPage",
    1
  );
  const [previewUsers, setPreviewUsers] = useState<PreviewUserDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [recipientsState, setRecipientsState] = useState<RecipientsState>(INITIAL_RECIPIENTS);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const audience = useAudienceTargetFields(form.target, "filters.admin.notifications");

  const broadcastsQuery = useFetchData<BroadcastDto[]>({
    queryKey: queryKeys.notifications.broadcasts(),
    request: async () => unwrapResult(await notificationApi.getBroadcasts()).broadcasts
  });

  const clearBroadcastsMutation = useApiMutation<{ success: boolean }, void>({
    request: async () => unwrapResult(await notificationApi.clearBroadcasts()),
    invalidateQueries: queryKeys.notifications.broadcasts()
  });

  const deleteBroadcastMutation = useApiMutation<{ success: boolean }, string>({
    request: async (id) => unwrapResult(await notificationApi.deleteBroadcast(id)),
    invalidateQueries: queryKeys.notifications.broadcasts()
  });

  const sendMutation = useApiMutation<{ sent: number }, SendCustomNotificationInput>({
    request: async (payload) => unwrapResult(await notificationApi.sendCustom(payload)),
    invalidateQueries: queryKeys.notifications.broadcasts()
  });

  const broadcasts = broadcastsQuery.data ?? [];

  const paginatedBroadcasts = useMemo(() => {
    const start = (broadcastsPage - 1) * BROADCASTS_PER_PAGE;
    return broadcasts.slice(start, start + BROADCASTS_PER_PAGE);
  }, [broadcasts, broadcastsPage]);

  const setField = useCallback((name: string, value: string) => {
    setFormState((p) => ({
      ...p,
      [name]: value,
      ...(name === "target" ? { targetValue: "" } : {})
    }));
    if (name === "target") audience.resetDirectSelection();
  }, [audience.resetDirectSelection]);

  const isFormInvalid = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return true;
    if (audienceTargetNeedsValue(form.target) && !form.targetValue) return true;
    if (form.target === "HOURS" && (!form.targetValue || Number.isNaN(parseFloat(form.targetValue))))
      return true;
    if (form.target === "USERS" && !audience.directSelectedIds.size) return true;
    return false;
  }, [form, audience.directSelectedIds.size]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isFormInvalid) return;

      if (form.target === "USERS") {
        const selected = audience.allVolunteers.filter((v) => audience.directSelectedIds.has(v.id));
        setPreviewUsers(selected);
        setSelectedIds(new Set(audience.directSelectedIds));
        setShowPreview(true);
        return;
      }

      setLoadingPreview(true);
      try {
        const users = unwrapResult(
          await notificationApi.previewTargets(form.target, form.targetValue || undefined)
        ).users;
        if (!users.length) {
          showToast("لا يوجد متطوعون يطابقون هذا الاستهداف", "error");
          return;
        }
        setPreviewUsers(users);
        setSelectedIds(new Set(users.map((u) => u.id)));
        setShowPreview(true);
      } catch (err) {
        showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء جلب البيانات"), "error");
      } finally {
        setLoadingPreview(false);
      }
    },
    [form, isFormInvalid, audience.allVolunteers, audience.directSelectedIds, showToast]
  );

  const toggleUser = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === previewUsers.length ? new Set() : new Set(previewUsers.map((u) => u.id))
    );
  }, [previewUsers]);

  const handleSendConfirmed = useCallback(async () => {
    setShowConfirm(false);
    setSubmitStatus("loading");
    try {
      const { sent } = await sendMutation.mutateAsync({
        title: form.title.trim(),
        message: form.message.trim(),
        target: form.target,
        targetValue: form.targetValue || undefined,
        link: form.link?.trim() || undefined,
        userIds: [...selectedIds]
      });
      showToast(`تم إرسال الإشعار لـ ${sent} متطوع`, "success");
      setFormState(EMPTY_FORM);
      audience.resetDirectSelection();
      setShowPreview(false);
      setPreviewUsers([]);
      setSelectedIds(new Set());
      setBroadcastsPage(1);
    } catch (err) {
      showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء الإرسال"), "error");
    } finally {
      setSubmitStatus("idle");
    }
  }, [form, selectedIds, sendMutation, showToast, audience.resetDirectSelection]);

  const closePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewUsers([]);
    setSelectedIds(new Set());
  }, []);

  const handleClearBroadcasts = useCallback(async () => {
    try {
      await clearBroadcastsMutation.mutateAsync();
      setBroadcastsPage(1);
      showToast("تم مسح السجل بنجاح", "success");
    } catch (err) {
      showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء المسح"), "error");
    } finally {
      setShowClearConfirm(false);
    }
  }, [clearBroadcastsMutation, showToast]);

  const recipientsQuery = useFetchData<BroadcastRecipientDto[]>({
    queryKey: queryKeys.notifications.broadcastRecipients(recipientsState.broadcastId ?? ""),
    request: async () =>
      unwrapResult(await notificationApi.getBroadcastRecipients(recipientsState.broadcastId!))
        .recipients,
    options: {
      enabled: recipientsState.open && Boolean(recipientsState.broadcastId),
      staleTime: 15_000
    }
  });

  const openRecipientsModal = useCallback((broadcastId: string, title: string) => {
    setRecipientsState({ open: true, broadcastId, title, recipients: [], loading: true });
  }, []);

  const closeRecipientsModal = useCallback(() => setRecipientsState(INITIAL_RECIPIENTS), []);

  const requestDeleteBroadcast = useCallback((broadcastId: string) => {
    setPendingDeleteId(broadcastId);
    setShowDeleteConfirm(true);
  }, []);

  const cancelDeleteBroadcast = useCallback(() => {
    setPendingDeleteId(null);
    setShowDeleteConfirm(false);
  }, []);

  const confirmDeleteBroadcast = useCallback(async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      await deleteBroadcastMutation.mutateAsync(pendingDeleteId);
      const maxPage = Math.ceil((broadcasts.length - 1) / BROADCASTS_PER_PAGE) || 1;
      setBroadcastsPage((p) => Math.min(p, maxPage));
      if (recipientsState.broadcastId === pendingDeleteId) closeRecipientsModal();
      showToast("تم حذف الإشعار بنجاح", "success");
    } catch (err) {
      showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء الحذف"), "error");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
      setShowDeleteConfirm(false);
    }
  }, [
    pendingDeleteId,
    recipientsState.broadcastId,
    closeRecipientsModal,
    showToast,
    deleteBroadcastMutation,
    broadcasts.length
  ]);

  return {
    status,
    form,
    submitStatus,
    loadingPreview,
    isFormInvalid,
    broadcasts,
    loadingBroadcasts: broadcastsQuery.isLoading,
    clearingBroadcasts: clearBroadcastsMutation.isPending,
    paginatedBroadcasts,
    broadcastsPage,
    setBroadcastsPage,
    broadcastsTotalItems: broadcasts.length,
    broadcastsPerPage: BROADCASTS_PER_PAGE,
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
    showClearConfirm,
    setShowClearConfirm,
    handleClearBroadcasts,
    audience,
    recipientsState: {
      ...recipientsState,
      recipients: recipientsQuery.data ?? recipientsState.recipients,
      loading: recipientsState.open && recipientsQuery.isLoading
    },
    openRecipientsModal,
    closeRecipientsModal,
    pendingDeleteId,
    showDeleteConfirm,
    deletingId,
    requestDeleteBroadcast,
    cancelDeleteBroadcast,
    confirmDeleteBroadcast,
    activityTitleMap: audience.activityTitleMap
  };
}
