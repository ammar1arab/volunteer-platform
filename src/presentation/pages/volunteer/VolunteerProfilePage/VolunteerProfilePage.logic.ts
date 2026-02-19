"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect, useMemo, useCallback } from "react";

import type { ActivityParticipationDto, UserProfileDto, Result } from "@/core/application/dtos";
import { participationApi, userApi, volunteerProfileApi } from "@/presentation/services";

interface EditingField {
  field: string;
  value: unknown;
}

function extractError(result: Result<unknown>): string {
  return !result.success ? result.error.message : "";
}

const ITEMS_PER_PAGE = 5;
const USER_FIELDS = ["email", "phone", "fullName"];

export function useProfilePage() {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [participations, setParticipations] = useState<ActivityParticipationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activityFilter]);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userResult, participationsResult] = await Promise.all([
        userApi.getProfile(),
        participationApi.getMyRequests()
      ]);

      if (!userResult.success) {
        setError(extractError(userResult));
        return;
      }

      if (!participationsResult.success) {
        setError(extractError(participationsResult));
        return;
      }

      setUser(userResult.data.user);
      setParticipations(participationsResult.data.requests);
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEditing = useCallback((field: string, currentValue: unknown) => {
    setEditingField({ field, value: currentValue });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const cancelEditing = useCallback(() => setEditingField(null), []);

  const updateFieldValue = useCallback((value: unknown) => {
    setEditingField((prev) => (prev ? { ...prev, value } : null));
  }, []);

  const saveField = useCallback(async () => {
    if (!editingField) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result: Result<unknown> = USER_FIELDS.includes(editingField.field)
        ? await userApi.updateBasicInfo({
            [editingField.field]: editingField.value
          })
        : await volunteerProfileApi.update({
            [editingField.field]: editingField.value
          });

      if (!result.success) {
        setError(extractError(result));
        return;
      }

      showSuccess("تم الحفظ بنجاح ✓");
      setEditingField(null);
      await fetchData();
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  }, [editingField, fetchData, showSuccess]);

  const handleProfilePictureUpload = useCallback(
    async (file: File) => {
      setIsUploadingImage(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const result = await volunteerProfileApi.uploadPicture(file);

        if (!result.success) {
          setError(extractError(result));
          return;
        }

        showSuccess("تم رفع الصورة بنجاح ✓");
        await fetchData();
      } catch {
        setError("حدث خطأ أثناء رفع الصورة");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [fetchData, showSuccess]
  );

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const calculateAge = useCallback((dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  const stats = useMemo(
    () => ({
      total: participations.length,
      pending: participations.filter((p) => p.status === "PENDING").length,
      approved: participations.filter((p) => p.status === "APPROVED").length,
      rejected: participations.filter((p) => p.status === "REJECTED").length
    }),
    [participations]
  );

  const filteredParticipations = useMemo(
    () => (activityFilter === "all" ? participations : participations.filter((p) => p.status === activityFilter)),
    [participations, activityFilter]
  );

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredParticipations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredParticipations, currentPage]);

  return {
    user,
    stats,
    isLoading,
    error,
    successMessage,
    editingField,
    isSaving,
    isUploadingImage,
    activityFilter,
    filteredParticipations,
    setActivityFilter,
    startEditing,
    cancelEditing,
    updateFieldValue,
    saveField,
    handleProfilePictureUpload,
    handleSignOut,
    calculateAge,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    paginatedActivities
  };
}
