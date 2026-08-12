"use client";

import { useCallback, useMemo } from "react";
import type { UserAnalyticsDto, UserActivityDto } from "@/core/application/dtos";
import { userApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useFetchData
} from "@/presentation/query";

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

  const error =
    (userQuery.error ? getErrorMessage(userQuery.error, "فشل في جلب بيانات المستخدم") : "") ||
    (activitiesQuery.error ? getErrorMessage(activitiesQuery.error, "فشل في جلب الفرص") : "");

  const userRefetch = userQuery.refetch;
  const activitiesRefetch = activitiesQuery.refetch;

  const refresh = useCallback(async () => {
    await Promise.all([userRefetch(), activitiesRefetch()]);
  }, [userRefetch, activitiesRefetch]);

  const activities = (activitiesQuery.data ?? EMPTY_ARRAY) as UserActivityDto[];

  return useMemo(
    () => ({
      user: userQuery.data ?? null,
      activities,
      loadingUser: userQuery.isLoading,
      loadingActivities: activitiesQuery.isLoading,
      error,
      refresh
    }),
    [
      userQuery.data,
      activities,
      userQuery.isLoading,
      activitiesQuery.isLoading,
      error,
      refresh
    ]
  );
};
