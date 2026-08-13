"use client";
import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserDetails, useToast, useAuth, usePageReset } from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import { ParticipationStatus, UserRole } from "@/core/domain/enums";
import { ROUTES } from "@/presentation/constants";

interface EditingField {
  field: string;
  value: unknown;
}

const ITEMS_PER_PAGE = 5;

export const useAdminUserDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const userId = params.id as string;
  const {
    user,
    activities,
    loadingUser,
    loadingActivities,
    saveField: persistField,
    toggleActive,
    deleteUser: persistDelete,
    saving,
    toggling,
    deleting
  } = useUserDetails(userId);

  const [activeFilter, setActiveFilterState] = useSessionStorageState(
    "filters.admin.userDetails.activeFilter",
    "all"
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.userDetails.currentPage",
    1
  );
  const setActiveFilter = usePageReset(setActiveFilterState, setCurrentPage);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

  const startEditing = useCallback((field: string, value: unknown) => setEditingField({ field, value }), []);
  const cancelEditing = useCallback(() => setEditingField(null), []);
  const updateFieldValue = useCallback((value: unknown) => setEditingField((p) => (p ? { ...p, value } : null)), []);

  const saveField = useCallback(async () => {
    if (!editingField) return;
    const ok = await persistField(editingField.field, editingField.value);
    if (ok) {
      showToast("تم الحفظ بنجاح", "success");
      setEditingField(null);
    } else {
      showToast("حدث خطأ أثناء الحفظ", "error");
    }
  }, [editingField, persistField, showToast]);

  const confirmToggleActive = useCallback(async () => {
    if (!user) return;
    setShowToggleConfirm(false);
    const ok = await toggleActive(!user.isActive);
    if (ok) {
      showToast(user.isActive ? "تم تعطيل الحساب ✓" : "تم تفعيل الحساب ✓", "success");
    } else {
      showToast("حدث خطأ أثناء تغيير الحالة", "error");
    }
  }, [user, toggleActive, showToast]);

  const deleteUser = useCallback(async () => {
    const ok = await persistDelete();
    if (ok) {
      showToast("تم حذف المستخدم بنجاح", "success");
      router.push(ROUTES.ADMIN.USERS);
    } else {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
    setShowDeleteConfirm(false);
  }, [persistDelete, router, showToast]);

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
          .reduce((sum, a) => sum + ((a as { volunteerHours?: number }).volunteerHours ?? 0), 0) * 100
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
        membershipNumber: user.volunteerProfile?.membershipNumber || "-",
        city: user.volunteerProfile?.city || "-",
        dateOfBirth: user.volunteerProfile?.dateOfBirth
          ? new Date(user.volunteerProfile.dateOfBirth).toLocaleDateString("ar")
          : "-",
        gender: user.volunteerProfile?.gender || "-",
        educationLevel: user.volunteerProfile?.educationLevel || "-",
        occupation: user.volunteerProfile?.occupation || "-",
        hasVolunteerExperience: user.volunteerProfile?.hasVolunteerExperience ? "نعم" : "لا",
        bio: user.volunteerProfile?.bio || "-",
        interests: user.volunteerProfile?.interests?.join(", ") || "-",
        skills: user.volunteerProfile?.skills?.join(", ") || "-",
        languages: user.volunteerProfile?.languages?.join(", ") || "-",
        preferredVolunteerTypes: user.volunteerProfile?.preferredVolunteerTypes?.join(", ") || "-",
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
    isSaving: saving,
    startEditing,
    cancelEditing,
    updateFieldValue,
    saveField,
    confirmToggleActive,
    isTogglingActive: toggling,
    showToggleConfirm,
    setShowToggleConfirm,
    deleteUser,
    isDeleting: deleting,
    showDeleteConfirm,
    setShowDeleteConfirm
  };
};
