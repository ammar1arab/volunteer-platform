"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import type {
  Result,
  UpdateUserRequest,
  UpdateVolunteerProfileRequest,
  UserProfileDto
} from "@/core/application/dtos";
import { userApi, volunteerProfileApi, certificateApi } from "@/presentation/services";
import {
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useFetchData
} from "@/presentation/query";

type ProfileFieldValue = string | number | boolean | string[] | null;

interface EditingField {
  field: string;
  value: ProfileFieldValue;
}

interface ProfilePageData {
  user: UserProfileDto;
  totalHours: number;
  certCount: number;
}

const USER_FIELDS = new Set(["email", "phone", "fullName"]);

function extractError<T>(result: Result<T>): string {
  return !result.success ? result.error.message : "";
}

export function useProfilePage() {
  const { update: updateSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditingField | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const query = useFetchData<ProfilePageData>({
    queryKey: queryKeys.profile.me(),
    request: async () => {
      const [userResult, certsResult] = await Promise.all([
        userApi.getProfile(),
        certificateApi.getByUser()
      ]);
      const user = unwrapResult(userResult).user;
      const certs = certsResult.success ? certsResult.data : { certificates: [], totalHours: 0 };
      return {
        user,
        totalHours: certs.totalHours ?? 0,
        certCount: certs.certificates?.length ?? 0
      };
    },
    errorCallback: (err) => setError(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ غير متوقع"))
  });

  const saveMutation = useApiMutation<void, EditingField>({
    request: async (field) => {
      let value: ProfileFieldValue = field.value;
      if (field.field === "hasVolunteerExperience") {
        value = value === true || value === "true";
      }
      if (
        (field.field === "educationLevel" ||
          field.field === "occupation" ||
          field.field === "membershipNumber") &&
        (value === "" || value == null)
      ) {
        value = null;
      }

      if (USER_FIELDS.has(field.field)) {
        const payload = { [field.field]: value } as UpdateUserRequest;
        unwrapResult(await userApi.updateBasicInfo(payload));
      } else {
        const payload = { [field.field]: value } as Omit<UpdateVolunteerProfileRequest, "userId">;
        unwrapResult(await volunteerProfileApi.update(payload));
      }
    },
    invalidateQueries: queryKeys.profile.me()
  });

  const uploadMutation = useApiMutation<string, File>({
    request: async (file) => unwrapResult(await volunteerProfileApi.uploadPicture(file)).imageUrl,
    invalidateQueries: queryKeys.profile.me()
  });

  const startEditing = useCallback((field: string, v: ProfileFieldValue) => {
    setEditingField({ field, value: v });
    setError(null);
    setSuccessMessage(null);
  }, []);

  const cancelEditing = useCallback(() => setEditingField(null), []);

  const updateFieldValue = useCallback((value: ProfileFieldValue) => {
    setEditingField((prev) => (prev ? { ...prev, value } : null));
  }, []);

  const saveField = useCallback(async () => {
    if (!editingField) return;
    setError(null);
    try {
      await saveMutation.mutateAsync(editingField);
      showSuccess("تم الحفظ بنجاح");
      setEditingField(null);
    } catch (err) {
      setError(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء الحفظ"));
    }
  }, [editingField, saveMutation, showSuccess]);

  const handleProfilePictureUpload = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const newUrl = await uploadMutation.mutateAsync(file);
        await updateSession({ profilePictureUrl: newUrl });
        showSuccess("تم رفع الصورة بنجاح ✓");
      } catch (err) {
        setError(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء رفع الصورة"));
      }
    },
    [showSuccess, updateSession, uploadMutation]
  );

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
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: error ?? (query.error ? getErrorMessage(query.error) : null),
    successMessage,
    editingField,
    isSaving: saveMutation.isPending,
    isUploadingImage: uploadMutation.isPending,
    startEditing,
    cancelEditing,
    updateFieldValue,
    saveField,
    handleProfilePictureUpload,
    handleSignOut,
    calculateAge,
    totalHours: query.data?.totalHours ?? 0,
    certCount: query.data?.certCount ?? 0
  };
}


export { extractError };
