"use client";

import { useCallback, useMemo, useState } from "react";
import { UserRole } from "@/core/domain/enums";
import { useAuth, useToast, useUsers, useConfirmDialog } from "@/presentation/hooks";
import { useSession } from "next-auth/react";
import { authApi, type UpdateAdminInfoRequest } from "@/presentation/services";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import type { AdminPermission } from "@/core/domain/enums";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import { queryKeys, useFetchData } from "@/presentation/query";

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
const EMPTY_EDIT: EditForm = { fullName: "", email: "", phone: "", password: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const usePermissionsPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { users, loading, submitting, createAdmin, updateUser, deleteAdmin } = useUsers();
  const { confirm, confirmDialog } = useConfirmDialog();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<UserAnalyticsDto | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT);
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.permissions.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearch] = useSessionStorageState(
    "filters.admin.permissions.appliedSearch",
    ""
  );
  const [emailToCheck, setEmailToCheck] = useState("");

  const emailQuery = useFetchData<boolean>({
    queryKey: queryKeys.auth.checkEmail(emailToCheck),
    request: () => authApi.checkEmail(emailToCheck),
    options: { enabled: EMAIL_RE.test(emailToCheck), staleTime: 30_000 }
  });

  const emailStatus: "idle" | "checking" | "taken" | "available" = !emailToCheck
    ? "idle"
    : emailQuery.isFetching
      ? "checking"
      : emailQuery.data
        ? "taken"
        : "available";

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

  const checkEmail = useCallback((email: string) => {
    const next = email.trim().toLowerCase();
    setEmailToCheck(EMAIL_RE.test(next) ? next : "");
  }, []);

  const resetCreateForm = useCallback(() => {
    setCreateForm(EMPTY_CREATE);
    setEmailToCheck("");
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
        : [...prev.permissions, permission]
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
    const ok = await createAdmin(createForm);
    if (ok) {
      showToast("تم إنشاء الأدمن بنجاح", "success");
      resetCreateForm();
    } else {
      showToast("حدث خطأ أثناء الإنشاء", "error");
    }
  }, [createForm, emailStatus, createAdmin, resetCreateForm, showToast]);

  const handleEdit = useCallback(async () => {
    if (!editTarget) return;
    if (!editForm.fullName.trim() || !editForm.email.trim() || !editForm.phone.trim()) {
      showToast("يرجى ملء الحقول المطلوبة", "error");
      return;
    }
    const payload: UpdateAdminInfoRequest = {
      fullName: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
      ...(editForm.password.trim() ? { password: editForm.password } : {})
    };
    const ok = await updateUser(editTarget.id, payload);
    if (ok) {
      showToast("تم تحديث البيانات", "success");
      resetEditForm();
    } else {
      showToast("حدث خطأ أثناء التحديث", "error");
    }
  }, [editTarget, editForm, updateUser, resetEditForm, showToast]);

  const handleDelete = useCallback(
    async (admin: UserAnalyticsDto) => {
      const ok = await confirm({
        title: "حذف الأدمن",
        message: `هل تريد حذف "${admin.fullName}"؟ سيتم إزالة جميع صلاحياته نهائياً.`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger"
      });
      if (!ok) return;
      if (await deleteAdmin(admin.id)) {
        showToast("تم حذف الأدمن", "success");
      } else {
        showToast("حدث خطأ أثناء الحذف", "error");
      }
    },
    [confirm, deleteAdmin, showToast]
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
    confirmDialog
  };
};
