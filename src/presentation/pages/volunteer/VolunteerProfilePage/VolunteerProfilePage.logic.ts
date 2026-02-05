"use client";

import { useState, useEffect, useMemo } from "react";
import {
  userApi,
  volunteerProfileApi,
  activityParticipationApi,
} from "@/lib/api";
import { signOut } from "next-auth/react";
import type {
  ActivityParticipationDto,
  UserProfileDto,
} from "@/core/application/dtos";

interface EditingField {
  field: string;
  value: any;
}

export function useProfilePage() {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [participations, setParticipations] = useState<
    ActivityParticipationDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activityFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userResponse, participationsResponse] = await Promise.all([
        userApi.getProfile(),
        activityParticipationApi.getMyRequests(),
      ]);

      if (!userResponse.success || !userResponse.user) {
        setError(userResponse.error || "فشل تحميل الملف الشخصي");
        return;
      }

      if (!participationsResponse.success) {
        setError(participationsResponse.error || "فشل تحميل الأنشطة");
        return;
      }

      setUser(userResponse.user);
      setParticipations(participationsResponse.requests || []);
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startEditing = (field: string, currentValue: any) => {
    setEditingField({ field, value: currentValue });
    setError(null);
    setSuccessMessage(null);
  };

  const cancelEditing = () => setEditingField(null);

  const updateFieldValue = (value: any) => {
    if (editingField) setEditingField({ ...editingField, value });
  };

  const saveField = async () => {
    if (!editingField) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userFields = ["email", "phone", "fullName"];
      const isUserField = userFields.includes(editingField.field);

      let result: any;

      if (isUserField) {
        result = await userApi.updateBasicInfo({
          [editingField.field]: editingField.value,
        });
      } else if (editingField.field === "dateOfBirth") {
        result = await volunteerProfileApi.updateProfile({
          dateOfBirth: editingField.value,
        } as any);
      } else {
        result = await volunteerProfileApi.updateProfile({
          [editingField.field]: editingField.value,
        });
      }

      if (!result.success) {
        setError(result.error || "فشل حفظ التعديلات");
        return;
      }

      setSuccessMessage("تم الحفظ بنجاح ✓");
      setEditingField(null);
      await fetchData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await volunteerProfileApi.uploadProfilePicture(file);

      if (!result.success) {
        setError(result.error || "فشل رفع الصورة");
        return;
      }

      setSuccessMessage("تم رفع الصورة بنجاح ✓");
      await fetchData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const stats = {
    total: participations.length,
    pending: participations.filter((p) => p.status === "PENDING").length,
    approved: participations.filter((p) => p.status === "APPROVED").length,
    rejected: participations.filter((p) => p.status === "REJECTED").length,
  };

  const filteredParticipations =
    activityFilter === "all"
      ? participations
      : participations.filter((p) => p.status === activityFilter);

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
    paginatedActivities,
  };
}
