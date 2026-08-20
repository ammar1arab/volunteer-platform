"use client";

import { useState, useCallback, useMemo } from "react";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useToast, usePageReset } from "@/presentation/hooks";
import type {
  BroadcastDto,
  BroadcastRecipientDto,
  PreviewUserDto,
  SendCustomNotificationInput,
  UserAnalyticsDto
} from "@/core/application/dtos";
import { userApi, notificationApi, activityApi } from "@/presentation/services";
import { CITY_OPTIONS, GENDER_OPTIONS } from "@/presentation/constants";
import { relativeTime } from "@/lib/utils";
import {
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useFetchData
} from "@/presentation/query";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

type SubmitStatus = "idle" | "loading";

const EMPTY_FORM: SendCustomNotificationInput = {
  title: "",
  message: "",
  target: "ALL",
  targetValue: "",
  link: ""
};

const BROADCASTS_PER_PAGE = 5;

export const TARGET_OPTIONS = [
  { value: "ALL", label: "جميع المتطوعين" },
  { value: "CITY", label: "حسب المدينة" },
  { value: "GENDER", label: "حسب الجنس" },
  { value: "HOURS", label: "حسب ساعات التطوع" },
  { value: "ACTIVITY_PENDING", label: "أصحاب الطلبات المعلقة لنشاط" },
  { value: "ACTIVITY_APPROVED", label: "المتطوعون المقبولون في نشاط" },
  { value: "USERS", label: "اختيار يدوي" }
];

export { CITY_OPTIONS, GENDER_OPTIONS, relativeTime };

interface RecipientsState {
  open: boolean;
  broadcastId: string | null;
  title: string;
  recipients: BroadcastRecipientDto[];
  loading: boolean;
}

interface ActivityFilterData {
  activities: { id: string; title: string }[];
  pending: Set<string>;
  approved: Set<string>;
}

interface ActivityFilterApiResponse {
  data?: { pending?: string[]; approved?: string[] };
}

const INITIAL_RECIPIENTS: RecipientsState = {
  open: false,
  broadcastId: null,
  title: "",
  recipients: [],
  loading: false
};

function mapVolunteerPreview(u: UserAnalyticsDto): PreviewUserDto {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.volunteerProfile?.profilePictureUrl || undefined,
    certifications: u.stats?.certificatesCount ?? 0,
    city: u.volunteerProfile?.city ?? null,
    gender: u.volunteerProfile?.gender ?? null,
    hours: u.stats?.totalHours ?? 0
  };
}

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
  const [volunteerSearch, setVolunteerSearchState] = useSessionStorageState(
    "filters.admin.notifications.volunteerSearch",
    ""
  );
  const [volunteersPage, setVolunteersPage] = useState(1);
  const setVolunteerSearch = usePageReset(setVolunteerSearchState, setVolunteersPage);
  const [directSelectedIds, setDirectSelectedIds] = useState<Set<string>>(new Set());
  const [recipientsState, setRecipientsState] = useState<RecipientsState>(INITIAL_RECIPIENTS);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const broadcastsQuery = useFetchData<BroadcastDto[]>({
    queryKey: queryKeys.notifications.broadcasts(),
    request: async () => unwrapResult(await notificationApi.getBroadcasts()).broadcasts
  });

  const volunteersQuery = useFetchData<PreviewUserDto[]>({
    queryKey: [...queryKeys.users.list(), "volunteers-preview"],
    request: async () => {
      const users = unwrapResult(await userApi.getAll()).users;
      return users
        .filter((u) => u.role === UserRole.VOLUNTEER && u.isActive)
        .map(mapVolunteerPreview);
    },
    options: { enabled: form.target === "USERS" }
  });

  const activitiesQuery = useFetchData<ActivityFilterData>({
    queryKey: queryKeys.notifications.activityFilter(),
    request: async () => {
      const [actRes, filterRes] = await Promise.all([
        activityApi.getPublished(),
        fetch("/api/notifications?activityFilter=1").then(
          (r) => r.json() as Promise<ActivityFilterApiResponse>
        )
      ]);
      const activities = unwrapResult(actRes).activities.map((a) => ({ id: a.id, title: a.title }));
      return {
        activities,
        pending: new Set(filterRes?.data?.pending ?? []),
        approved: new Set(filterRes?.data?.approved ?? [])
      };
    }
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
  const allVolunteers = volunteersQuery.data ?? [];
  const allActivities = activitiesQuery.data?.activities ?? [];
  const activityIdsWithPending = activitiesQuery.data?.pending ?? new Set<string>();
  const activityIdsWithApproved = activitiesQuery.data?.approved ?? new Set<string>();

  const paginatedBroadcasts = useMemo(() => {
    const start = (broadcastsPage - 1) * BROADCASTS_PER_PAGE;
    return broadcasts.slice(start, start + BROADCASTS_PER_PAGE);
  }, [broadcasts, broadcastsPage]);

  const activityOptions = useMemo(() => {
    const filterSet =
      form.target === "ACTIVITY_PENDING"
        ? activityIdsWithPending
        : form.target === "ACTIVITY_APPROVED"
          ? activityIdsWithApproved
          : null;

    return allActivities
      .filter((a) => !filterSet || filterSet.has(a.id))
      .map((a) => ({ value: a.id, label: a.title }));
  }, [allActivities, form.target, activityIdsWithPending, activityIdsWithApproved]);

  const activityTitleMap = useMemo(
    () => new Map(allActivities.map((a) => [a.id, a.title])),
    [allActivities]
  );

  const filteredVolunteers = useMemo(() => {
    const q = volunteerSearch.trim().toLowerCase();
    return q ? allVolunteers.filter((v) => v.name.toLowerCase().includes(q)) : allVolunteers;
  }, [allVolunteers, volunteerSearch]);

  const setField = useCallback((name: string, value: string) => {
    setFormState((p) => ({
      ...p,
      [name]: value,
      ...(name === "target" ? { targetValue: "" } : {})
    }));
    if (name === "target") {
      setDirectSelectedIds(new Set());
      setVolunteerSearch("");
    }
  }, []);

  const toggleDirectUser = useCallback((id: string) => {
    setDirectSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAllDirect = useCallback(() => {
    setDirectSelectedIds((prev) => {
      const visibleIds = filteredVolunteers.map((v) => v.id);
      const allSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      allSelected
        ? visibleIds.forEach((id) => next.delete(id))
        : visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredVolunteers]);

  const isFormInvalid = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return true;
    if (
      ["CITY", "GENDER", "ACTIVITY_PENDING", "ACTIVITY_APPROVED"].includes(form.target) &&
      !form.targetValue
    )
      return true;
    if (form.target === "HOURS" && (!form.targetValue || isNaN(parseFloat(form.targetValue))))
      return true;
    if (form.target === "USERS" && !directSelectedIds.size) return true;
    return false;
  }, [form, directSelectedIds.size]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isFormInvalid) return;

      if (form.target === "USERS") {
        const selected = allVolunteers.filter((v) => directSelectedIds.has(v.id));
        setPreviewUsers(selected);
        setSelectedIds(new Set(directSelectedIds));
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
    [form, isFormInvalid, allVolunteers, directSelectedIds, showToast]
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
      setDirectSelectedIds(new Set());
      setVolunteerSearch("");
      setShowPreview(false);
      setPreviewUsers([]);
      setSelectedIds(new Set());
      setBroadcastsPage(1);
    } catch (err) {
      showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء الإرسال"), "error");
    } finally {
      setSubmitStatus("idle");
    }
  }, [form, selectedIds, sendMutation, showToast]);

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
    allVolunteers,
    filteredVolunteers,
    loadingVolunteers: volunteersQuery.isLoading,
    volunteerSearch,
    setVolunteerSearch,
    volunteersPage,
    setVolunteersPage,
    directSelectedIds,
    toggleDirectUser,
    toggleAllDirect,
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
    activityOptions,
    activityTitleMap,
    loadingActivities: activitiesQuery.isLoading
  };
}
