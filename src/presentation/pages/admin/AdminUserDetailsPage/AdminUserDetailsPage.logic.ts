"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserDetails, useToast, useAuth } from "@/presentation/hooks";
import { ParticipationStatus, UserRole } from "@/core/domain/enums";
import { userApi, volunteerProfileApi } from "@/presentation/services";
import { ROUTES } from "@/presentation/constants";

interface EditingField {
  field: string;
  value: unknown;
}

const ITEMS_PER_PAGE = 5;
const USER_FIELDS = ["email", "phone", "fullName"];

export const useAdminUserDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const userId = params.id as string;
  const { user, activities, loadingUser, loadingActivities, error, refresh } = useUserDetails(userId);

  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

  useEffect(() => {
    if (error?.trim()) showToast(error, "error");
  }, [error, showToast]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const startEditing = useCallback((field: string, value: unknown) => setEditingField({ field, value }), []);
  const cancelEditing = useCallback(() => setEditingField(null), []);
  const updateFieldValue = useCallback((value: unknown) => setEditingField((p) => (p ? { ...p, value } : null)), []);

  const VP_FIELDS = ["city", "dateOfBirth", "gender"];

  const saveField = useCallback(async () => {
    if (!editingField) return;
    setIsSaving(true);
    try {
      const isVpField = VP_FIELDS.includes(editingField.field);
      const result = isVpField
        ? await userApi.updateVolunteerProfile(userId, { [editingField.field]: editingField.value })
        : await userApi.updateUserById(userId, { [editingField.field]: editingField.value });
      if (!result.success) {
        showToast(result.error.message, "error");
        return;
      }
      showToast("تم الحفظ بنجاح", "success");
      setEditingField(null);
      refresh();
    } catch {
      showToast("حدث خطأ أثناء الحفظ", "error");
    } finally {
      setIsSaving(false);
    }
  }, [editingField, userId, refresh, showToast]);

  const confirmToggleActive = useCallback(async () => {
    if (!user) return;
    setIsTogglingActive(true);
    setShowToggleConfirm(false);
    try {
      const result = await userApi.toggleActive(userId, !user.isActive);
      if (!result.success) {
        showToast(result.error.message, "error");
        return;
      }
      showToast(result.data.isActive ? "تم تفعيل الحساب ✓" : "تم تعطيل الحساب ✓", "success");
      refresh();
    } catch {
      showToast("حدث خطأ أثناء تغيير الحالة", "error");
    } finally {
      setIsTogglingActive(false);
    }
  }, [user, userId, refresh, showToast]);

  const deleteUser = useCallback(async () => {
    setIsDeleting(true);
    try {
      const result = await userApi.deleteAdmin(userId);
      if (!result.success) {
        showToast(result.error.message, "error");
        return;
      }
      showToast("تم حذف المستخدم بنجاح", "success");
      router.push(ROUTES.ADMIN.USERS);
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [userId, router, showToast]);

  const filteredActivities = useMemo(() => {
    const base =
      activeFilter === "all"
        ? activities
        : activities.filter((a) => a.status === (activeFilter as ParticipationStatus));
    return [...base].sort((a, b) => (b.volunteerHours ?? 0) - (a.volunteerHours ?? 0));
  }, [activities, activeFilter]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  const totalHours = useMemo(
    () =>
      Math.round(
        activities
          .filter((a) => a.status === ParticipationStatus.APPROVED)
          .reduce((sum, a) => sum + ((a as any).volunteerHours ?? 0), 0) * 100
      ) / 100,
    [activities]
  );

  const exportData = useMemo(() => {
    if (!user) return [];
    return [
      {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        city: user.volunteerProfile?.city || "-",
        dateOfBirth: user.volunteerProfile?.dateOfBirth
          ? new Date(user.volunteerProfile.dateOfBirth).toLocaleDateString("ar")
          : "-",
        gender: user.volunteerProfile?.gender || "-",
        bio: user.volunteerProfile?.bio || "-",
        interests: user.volunteerProfile?.interests?.join(", ") || "-",
        skills: user.volunteerProfile?.skills?.join(", ") || "-",
        activities: activities.map((a) => a.activity.title).join(", ") || "-",
        createdAt: new Date(user.createdAt).toLocaleDateString("ar")
      }
    ];
  }, [user, activities]);

  return {
    status,
    user,
    activities: paginatedActivities,
    allActivities: activities,
    totalFilteredItems: filteredActivities.length,
    loadingUser,
    loadingActivities,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    toasts,
    removeToast,
    exportData,
    totalHours,
    editingField,
    isSaving,
    startEditing,
    cancelEditing,
    updateFieldValue,
    saveField,
    confirmToggleActive,
    isTogglingActive,
    showToggleConfirm,
    setShowToggleConfirm,
    deleteUser,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm
  };
};
