"use client";

import { useCallback, useMemo } from "react";
import type { UserAnalyticsDto, UserActivityDto } from "@/core/application/dtos";
import { userApi, type UpdateAdminInfoRequest } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

const VP_FIELDS = new Set([
  "city",
  "dateOfBirth",
  "gender",
  "membershipNumber",
  "educationLevel",
  "occupation",
  "hasVolunteerExperience"
]);

const NULLABLE_VP = new Set(["educationLevel", "occupation", "membershipNumber"]);

export const useUserDetails = (userId: string) => {
  const userQuery = useFetchData<UserAnalyticsDto>({
    queryKey: queryKeys.users.detail(userId),
    request: async () => unwrapResult(await userApi.getById(userId)).user,
    options: { enabled: Boolean(userId), staleTime: 30_000 }
  });

  const activitiesQuery = useFetchData<UserActivityDto[]>({
    queryKey: queryKeys.users.activities(userId),
    request: async () => unwrapResult(await userApi.getActivities(userId)).activities,
    options: { enabled: Boolean(userId), staleTime: 30_000 }
  });

  const invalidate = [queryKeys.users.detail(userId), queryKeys.users.all];

  const saveMutation = useBooleanMutation<{ field: string; value: unknown }>({
    request: async ({ field, value }) => {
      let next = value;
      if (field === "hasVolunteerExperience") next = value === true || value === "true";
      if (NULLABLE_VP.has(field) && (next === "" || next == null)) next = null;
      if (VP_FIELDS.has(field)) {
        unwrapResult(await userApi.updateVolunteerProfile(userId, { [field]: next }));
        return;
      }
      unwrapResult(await userApi.updateUserById(userId, { [field]: value } as UpdateAdminInfoRequest));
    },
    invalidateQueries: invalidate,
    fallbackError: "حدث خطأ أثناء الحفظ"
  });

  const toggleMutation = useBooleanMutation<boolean>({
    request: async (isActive) => unwrapResult(await userApi.toggleActive(userId, isActive)),
    invalidateQueries: invalidate,
    fallbackError: "حدث خطأ أثناء تغيير الحالة"
  });

  const deleteMutation = useBooleanMutation<void>({
    request: async () => unwrapResult(await userApi.deleteAdmin(userId)),
    invalidateQueries: queryKeys.users.all,
    fallbackError: "حدث خطأ أثناء الحذف"
  });

  const error =
    (userQuery.error ? getErrorMessage(userQuery.error, "فشل في جلب بيانات المستخدم") : "") ||
    (activitiesQuery.error ? getErrorMessage(activitiesQuery.error, "فشل في جلب الفرص") : "");

  const userRefetch = userQuery.refetch;
  const activitiesRefetch = activitiesQuery.refetch;

  const refresh = useCallback(async () => {
    await Promise.all([userRefetch(), activitiesRefetch()]);
  }, [userRefetch, activitiesRefetch]);

  const saveField = useCallback(
    (field: string, value: unknown) => saveMutation.run({ field, value }),
    [saveMutation.run]
  );
  const toggleActive = useCallback(
    (isActive: boolean) => toggleMutation.run(isActive),
    [toggleMutation.run]
  );
  const deleteUser = useCallback(() => deleteMutation.run(), [deleteMutation.run]);

  const activities = (activitiesQuery.data ?? EMPTY_ARRAY) as UserActivityDto[];

  return useMemo(
    () => ({
      user: userQuery.data ?? null,
      activities,
      loadingUser: userQuery.isLoading,
      loadingActivities: activitiesQuery.isLoading,
      error,
      refresh,
      saveField,
      toggleActive,
      deleteUser,
      saving: saveMutation.submitting,
      toggling: toggleMutation.submitting,
      deleting: deleteMutation.submitting,
      mutationError:
        saveMutation.error || toggleMutation.error || deleteMutation.error
    }),
    [
      userQuery.data,
      activities,
      userQuery.isLoading,
      activitiesQuery.isLoading,
      error,
      refresh,
      saveField,
      toggleActive,
      deleteUser,
      saveMutation.submitting,
      toggleMutation.submitting,
      deleteMutation.submitting,
      saveMutation.error,
      toggleMutation.error,
      deleteMutation.error
    ]
  );
};
