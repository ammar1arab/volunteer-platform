"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import type { UserProfileDto, Result } from "@/core/application/dtos";
import { userApi, volunteerProfileApi, certificateApi } from "@/presentation/services";

interface EditingField {
  field: string;
  value: unknown;
}

function extractError(result: Result<unknown>): string {
  return !result.success ? result.error.message : "";
}

const USER_FIELDS = ["email", "phone", "fullName"];

export function useProfilePage() {
  const { update: updateSession } = useSession();

  const [user, setUser]                         = useState<UserProfileDto | null>(null);
  const [totalHours, setTotalHours]             = useState(0);
  const [certCount, setCertCount]               = useState(0);
  const [isLoading, setIsLoading]               = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  const [successMessage, setSuccessMessage]     = useState<string | null>(null);
  const [editingField, setEditingField]         = useState<EditingField | null>(null);
  const [isSaving, setIsSaving]                 = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userResult, certsResult] = await Promise.all([
        userApi.getProfile(),
        certificateApi.getByUser()
      ]);

      if (!userResult.success) { setError(extractError(userResult)); return; }
      setUser(userResult.data.user);

      if (certsResult.success && certsResult.data) {
        setTotalHours(certsResult.data.totalHours ?? 0);
        setCertCount(certsResult.data.certificates?.length ?? 0);
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEditing    = useCallback((field: string, v: unknown) => {
    setEditingField({ field, value: v });
    setError(null);
    setSuccessMessage(null);
  }, []);
  const cancelEditing   = useCallback(() => setEditingField(null), []);
  const updateFieldValue = useCallback((value: unknown) => {
    setEditingField(prev => prev ? { ...prev, value } : null);
  }, []);

  const saveField = useCallback(async () => {
    if (!editingField) return;
    setIsSaving(true);
    setError(null);
    try {
      const result: Result<unknown> = USER_FIELDS.includes(editingField.field)
        ? await userApi.updateBasicInfo({ [editingField.field]: editingField.value })
        : await volunteerProfileApi.update({ [editingField.field]: editingField.value });
      if (!result.success) { setError(extractError(result)); return; }
      showSuccess("تم الحفظ بنجاح");
      setEditingField(null);
      await fetchData();
    } catch {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  }, [editingField, fetchData, showSuccess]);

  const handleProfilePictureUpload = useCallback(async (file: File) => {
    setIsUploadingImage(true);
    setError(null);
    try {
      const result = await volunteerProfileApi.uploadPicture(file);
      if (!result.success) { setError(extractError(result)); return; }

      // refresh page data
      await fetchData();

      // update JWT so header avatar updates immediately without re-login
      const newUrl = (result as any)?.data?.imageUrl ?? null;
      if (newUrl) {
        await updateSession({ profilePictureUrl: newUrl });
      }

      showSuccess("تم رفع الصورة بنجاح ✓");
    } catch {
      setError("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploadingImage(false);
    }
  }, [fetchData, showSuccess, updateSession]);

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const calculateAge = useCallback((dob: string): number => {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  return {
    user, isLoading, error, successMessage,
    editingField, isSaving, isUploadingImage,
    startEditing, cancelEditing, updateFieldValue, saveField,
    handleProfilePictureUpload, handleSignOut, calculateAge,
    totalHours, certCount
  };
}