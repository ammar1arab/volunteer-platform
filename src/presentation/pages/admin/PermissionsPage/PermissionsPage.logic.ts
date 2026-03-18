"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useToast, useUsers } from "@/presentation/hooks";
import { useSession } from "next-auth/react";
import { userApi, type UpdateAdminInfoRequest } from "@/presentation/services";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import type { AdminPermission } from "@/core/domain/enums";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

interface CreateForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  permissions: string[];
}

interface EditForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const EMPTY_CREATE: CreateForm = { fullName: "", email: "", phone: "", password: "", permissions: [] };
const EMPTY_EDIT:   EditForm   = { fullName: "", email: "", phone: "", password: "" };

export const usePermissionsPage = () => {
  const { status }                      = useAuth({ requireRole: UserRole.ADMIN });
  const { data: session }               = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { users, loading, error, refresh } = useUsers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [editTarget,      setEditTarget]      = useState<UserAnalyticsDto | null>(null);
  const [createForm,      setCreateForm]      = useState<CreateForm>(EMPTY_CREATE);
  const [editForm,        setEditForm]        = useState<EditForm>(EMPTY_EDIT);
  const [submitting,      setSubmitting]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [appliedSearch,   setAppliedSearch]   = useState("");

  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");

  const [isConfirmOpen,    setIsConfirmOpen]    = useState(false);
  const [confirmOptions,   setConfirmOptions]   = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver,  setConfirmResolver]  = useState<((v: boolean) => void) | null>(null);

  useEffect(() => {
    if (error?.trim()) showToast(error, "error");
  }, [error, showToast]);

  const currentUserId = session?.user?.id;

  const admins = useMemo(() => {
    let result = users.filter((u) => u.role === "ADMIN" && u.id !== currentUserId);
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, appliedSearch, currentUserId]);

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

  const checkEmail = useCallback(async (email: string) => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    try {
      const res  = await fetch("/api/auth/check-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.toLowerCase() }),
      });
      const data = await res.json();
      setEmailStatus(data.taken ? "taken" : "available");
    } catch {
      setEmailStatus("idle");
    }
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateForm(EMPTY_CREATE);
    setEmailStatus("idle");
    setShowCreateModal(false);
  }, []);

  const openEdit = useCallback((admin: UserAnalyticsDto) => {
    setEditTarget(admin);
    setEditForm({ fullName: admin.fullName, email: admin.email, phone: admin.phone, password: "" });
    setShowEditModal(true);
  }, []);

  const resetEditForm = useCallback(() => {
    setEditTarget(null);
    setEditForm(EMPTY_EDIT);
    setShowEditModal(false);
  }, []);

  const toggleCreatePermission = useCallback((permission: AdminPermission) => {
    setCreateForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim() || !createForm.phone.trim()) {
      showToast("يرجى ملء جميع الحقول المطلوبة", "error");
      return;
    }
    if (emailStatus === "taken") {
      showToast("البريد الإلكتروني مستخدم مسبقاً", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await userApi.createAdmin(createForm);
      if (res.success) {
        showToast("تم إنشاء الأدمن بنجاح", "success");
        resetCreateForm();
        refresh();
      } else {
        showToast(res.error?.message ?? "حدث خطأ", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الإنشاء", "error");
    } finally {
      setSubmitting(false);
    }
  }, [createForm, emailStatus, resetCreateForm, refresh, showToast]);

  const handleEdit = useCallback(async () => {
    if (!editTarget) return;
    if (!editForm.fullName.trim() || !editForm.email.trim() || !editForm.phone.trim()) {
      showToast("يرجى ملء الحقول المطلوبة", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload: UpdateAdminInfoRequest = {
        fullName: editForm.fullName,
        email:    editForm.email,
        phone:    editForm.phone,
        ...(editForm.password.trim() ? { password: editForm.password } : {}),
      };
      const res = await userApi.updateUserById(editTarget.id, payload);
      if (res.success) {
        showToast("تم تحديث البيانات", "success");
        resetEditForm();
        refresh();
      } else {
        showToast(res.error?.message ?? "حدث خطأ", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء التحديث", "error");
    } finally {
      setSubmitting(false);
    }
  }, [editTarget, editForm, resetEditForm, refresh, showToast]);

  const handleDelete = useCallback(
    async (admin: UserAnalyticsDto) => {
      const ok = await confirm({
        title:       "حذف الأدمن",
        message:     `هل تريد حذف "${admin.fullName}"؟ سيتم إزالة جميع صلاحياته نهائياً.`,
        confirmText: "حذف",
        cancelText:  "إلغاء",
        variant:     "danger",
      });
      if (!ok) return;
      try {
        const res = await userApi.deleteAdmin(admin.id);
        if (res.success) {
          showToast("تم حذف الأدمن", "success");
          refresh();
        } else {
          showToast(res.error?.message ?? "حدث خطأ", "error");
        }
      } catch {
        showToast("حدث خطأ أثناء الحذف", "error");
      }
    },
    [confirm, refresh, showToast]
  );

  return {
    status,
    loading,
    admins,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    editTarget,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    submitting,
    emailStatus,
    checkEmail,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    toggleCreatePermission,
    handleCreate,
    handleEdit,
    handleDelete,
    openEdit,
    resetCreateForm,
    resetEditForm,
    toasts,
    removeToast,
    showToast,
    confirmDialog: {
      isOpen:        isConfirmOpen,
      options:       confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel:  handleCancelDialog,
    },
  };
};