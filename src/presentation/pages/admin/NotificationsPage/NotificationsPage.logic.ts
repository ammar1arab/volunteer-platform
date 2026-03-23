"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useToast } from "@/presentation/hooks";
import type { BroadcastDto, BroadcastRecipientDto, PreviewUserDto, SendCustomNotificationInput } from "@/core/application/dtos";
import { notificationApi } from "@/presentation/services/notification.service";
import { userApi } from "@/presentation/services";
import { CITY_OPTIONS, GENDER_OPTIONS } from "@/presentation/constants";
import { relativeTime } from "@/lib/utils";

type SubmitStatus = "idle" | "loading";

const EMPTY_FORM: SendCustomNotificationInput = {
  title: "", message: "", target: "ALL", targetValue: "", link: "",
};

export const TARGET_OPTIONS = [
  { value: "ALL",    label: "جميع المتطوعين"    },
  { value: "CITY",   label: "حسب المدينة"       },
  { value: "GENDER", label: "حسب الجنس"         },
  { value: "HOURS",  label: "حسب ساعات التطوع"  },
  { value: "USERS",  label: "اختيار مباشر"      },
];

export { CITY_OPTIONS, GENDER_OPTIONS, relativeTime };

interface RecipientsState {
  open:        boolean;
  broadcastId: string | null;
  title:       string;
  recipients:  BroadcastRecipientDto[];
  loading:     boolean;
}

const INITIAL_RECIPIENTS: RecipientsState = {
  open: false, broadcastId: null, title: "", recipients: [], loading: false,
};

export function useNotificationsPageLogic() {
  const { status }                   = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();

  const [form,             setFormState]      = useState<SendCustomNotificationInput>(EMPTY_FORM);
  const [submitStatus,     setSubmitStatus]   = useState<SubmitStatus>("idle");
  const [broadcasts,       setBroadcasts]     = useState<BroadcastDto[]>([]);
  const [loadingBroadcasts,setLoadingBroadcasts] = useState(true);
  const [previewUsers,     setPreviewUsers]   = useState<PreviewUserDto[]>([]);
  const [selectedIds,      setSelectedIds]    = useState<Set<string>>(new Set());
  const [showPreview,      setShowPreview]    = useState(false);
  const [loadingPreview,   setLoadingPreview] = useState(false);
  const [showConfirm,      setShowConfirm]    = useState(false);
  const [clearingBroadcasts, setClearingBroadcasts] = useState(false);

  const [allVolunteers,    setAllVolunteers]     = useState<PreviewUserDto[]>([]);
  const [loadingVolunteers,setLoadingVolunteers] = useState(false);
  const [volunteerSearch,  setVolunteerSearch]   = useState("");
  const [directSelectedIds,setDirectSelectedIds] = useState<Set<string>>(new Set());

  const [recipientsState,  setRecipientsState]   = useState<RecipientsState>(INITIAL_RECIPIENTS);
  const [pendingDeleteId,  setPendingDeleteId]    = useState<string | null>(null);
  const [deletingId,       setDeletingId]         = useState<string | null>(null);
  const [showDeleteConfirm,setShowDeleteConfirm]  = useState(false);

  const fetchBroadcasts = useCallback(async () => {
    setLoadingBroadcasts(true);
    try {
      const res = await notificationApi.getBroadcasts();
      setBroadcasts((res as any)?.data?.broadcasts ?? []);
    } finally {
      setLoadingBroadcasts(false);
    }
  }, []);

  useEffect(() => { fetchBroadcasts(); }, [fetchBroadcasts]);

  const fetchAllVolunteers = useCallback(async () => {
    if (allVolunteers.length) return;
    setLoadingVolunteers(true);
    try {
      const res = await userApi.getAll();
      const users = (res as any)?.data?.users ?? [];
      setAllVolunteers(
        users
          .filter((u: any) => u.role === "VOLUNTEER" && u.isActive)
          .map((u: any) => ({
            id:     u.id,
            name:   u.fullName,
            city:   u.volunteerProfile?.city   ?? null,
            gender: u.volunteerProfile?.gender ?? null,
            hours:  u.stats?.totalHours        ?? 0,
          }))
      );
    } catch {
      showToast("حدث خطأ أثناء جلب المتطوعين", "error");
    } finally {
      setLoadingVolunteers(false);
    }
  }, [allVolunteers.length, showToast]);

  useEffect(() => {
    if (form.target === "USERS") fetchAllVolunteers();
  }, [form.target, fetchAllVolunteers]);

  const filteredVolunteers = useMemo(() => {
    const q = volunteerSearch.trim().toLowerCase();
    return q ? allVolunteers.filter(v => v.name.toLowerCase().includes(q)) : allVolunteers;
  }, [allVolunteers, volunteerSearch]);

  const setField = useCallback((name: string, value: string) => {
    setFormState(p => ({ ...p, [name]: value, ...(name === "target" ? { targetValue: "" } : {}) }));
    if (name === "target") {
      setDirectSelectedIds(new Set());
      setVolunteerSearch("");
    }
  }, []);

  const toggleDirectUser = useCallback((id: string) => {
    setDirectSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAllDirect = useCallback(() => {
    setDirectSelectedIds(prev => {
      const visibleIds = filteredVolunteers.map(v => v.id);
      const allSelected = visibleIds.every(id => prev.has(id));
      const next = new Set(prev);
      allSelected
        ? visibleIds.forEach(id => next.delete(id))
        : visibleIds.forEach(id => next.add(id));
      return next;
    });
  }, [filteredVolunteers]);

  const isFormInvalid = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return true;
    if (["CITY", "GENDER"].includes(form.target) && !form.targetValue) return true;
    if (form.target === "HOURS" && (!form.targetValue || isNaN(parseFloat(form.targetValue)))) return true;
    if (form.target === "USERS" && !directSelectedIds.size) return true;
    return false;
  }, [form, directSelectedIds.size]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    if (form.target === "USERS") {
      const selected = allVolunteers.filter(v => directSelectedIds.has(v.id));
      setPreviewUsers(selected);
      setSelectedIds(new Set(directSelectedIds));
      setShowPreview(true);
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await notificationApi.previewTargets(form.target, form.targetValue || undefined);
      const users = (res as any)?.data?.users ?? [];
      if (!users.length) { showToast("لا يوجد متطوعون يطابقون هذا الاستهداف", "error"); return; }
      setPreviewUsers(users);
      setSelectedIds(new Set(users.map((u: PreviewUserDto) => u.id)));
      setShowPreview(true);
    } catch {
      showToast("حدث خطأ أثناء جلب البيانات", "error");
    } finally {
      setLoadingPreview(false);
    }
  }, [form, isFormInvalid, allVolunteers, directSelectedIds, showToast]);

  const toggleUser = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev =>
      prev.size === previewUsers.length ? new Set() : new Set(previewUsers.map(u => u.id))
    );
  }, [previewUsers]);

  const handleSendConfirmed = useCallback(async () => {
    setShowConfirm(false);
    setSubmitStatus("loading");
    try {
      const res = await notificationApi.sendCustom({
        title:       form.title.trim(),
        message:     form.message.trim(),
        target:      form.target,
        targetValue: form.targetValue || undefined,
        link:        form.link?.trim() || undefined,
        userIds:     [...selectedIds],
      });
      const sent = (res as any)?.data?.sent ?? 0;
      showToast(`تم إرسال الإشعار لـ ${sent} متطوع`, "success");
      setFormState(EMPTY_FORM);
      setDirectSelectedIds(new Set());
      setVolunteerSearch("");
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

  const openRecipientsModal = useCallback(async (broadcastId: string, title: string) => {
    setRecipientsState({ open: true, broadcastId, title, recipients: [], loading: true });
    try {
      const res = await notificationApi.getBroadcastRecipients(broadcastId);
      setRecipientsState(prev => ({
        ...prev,
        recipients: (res as any)?.data?.recipients ?? [],
        loading:    false,
      }));
    } catch {
      setRecipientsState(prev => ({ ...prev, loading: false }));
      showToast("حدث خطأ أثناء جلب المستقبلين", "error");
    }
  }, [showToast]);

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
      const res = await notificationApi.deleteBroadcast(pendingDeleteId);
      if (!(res as any).success) { showToast((res as any).error?.message, "error"); return; }
      setBroadcasts(prev => prev.filter(b => b.broadcastId !== pendingDeleteId));
      if (recipientsState.broadcastId === pendingDeleteId) closeRecipientsModal();
      showToast("تم حذف الإشعار بنجاح", "success");
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
      setShowDeleteConfirm(false);
    }
  }, [pendingDeleteId, recipientsState.broadcastId, closeRecipientsModal, showToast]);

  return {
    status, form, submitStatus, loadingPreview, isFormInvalid,
    broadcasts, loadingBroadcasts, clearingBroadcasts,
    toasts, removeToast,
    previewUsers, selectedIds, showPreview, showConfirm,
    setField, handleSubmit, toggleUser, toggleAll,
    setShowConfirm, handleSendConfirmed, closePreview, handleClearBroadcasts,
    allVolunteers, filteredVolunteers, loadingVolunteers,
    volunteerSearch, setVolunteerSearch,
    directSelectedIds, toggleDirectUser, toggleAllDirect,
    recipientsState, openRecipientsModal, closeRecipientsModal,
    pendingDeleteId, showDeleteConfirm, deletingId,
    requestDeleteBroadcast, cancelDeleteBroadcast, confirmDeleteBroadcast,
  };
}