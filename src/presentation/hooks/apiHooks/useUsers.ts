"use client";

import { useCallback, useMemo } from "react";
import { userApi, type UpdateAdminInfoRequest } from "@/presentation/services";
import type { CreateAdminRequest, UserAnalyticsDto } from "@/core/application/dtos";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

const USERS_INVALIDATE = queryKeys.users.all;

export const useUsers = (options: { enabled?: boolean; autoLoad?: boolean } = {}) => {
  const enabled = options.enabled ?? options.autoLoad ?? true;

  const query = useFetchData<UserAnalyticsDto[]>({
    queryKey: queryKeys.users.list(),
    request: async () => unwrapResult(await userApi.getAll()).users,
    options: { enabled, staleTime: 45_000, keepPrevious: true }
  });

  const createAdminMutation = useBooleanMutation<CreateAdminRequest>({
    request: async (payload) => unwrapResult(await userApi.createAdmin(payload)),
    invalidateQueries: USERS_INVALIDATE,
    fallbackError: "حدث خطأ أثناء الإنشاء"
  });

  const updateUserMutation = useBooleanMutation<{ id: string; payload: UpdateAdminInfoRequest }>({
    request: async ({ id, payload }) => unwrapResult(await userApi.updateUserById(id, payload)),
    invalidateQueries: USERS_INVALIDATE,
    fallbackError: "حدث خطأ أثناء التحديث"
  });

  const deleteAdminMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await userApi.deleteAdmin(id)),
    invalidateQueries: USERS_INVALIDATE,
    fallbackError: "حدث خطأ أثناء الحذف"
  });

  const toggleActiveMutation = useBooleanMutation<{ id: string; isActive: boolean }>({
    request: async ({ id, isActive }) => unwrapResult(await userApi.toggleActive(id, isActive)),
    invalidateQueries: USERS_INVALIDATE,
    fallbackError: "حدث خطأ أثناء تغيير الحالة"
  });

  const refetch = query.refetch;
  const users = (query.data ?? EMPTY_ARRAY) as UserAnalyticsDto[];
  const error = query.error ? getErrorMessage(query.error, "فشل في جلب المستخدمين") : "";
  const refresh = useCallback(() => refetch(), [refetch]);

  const createAdmin = useCallback(
    (payload: CreateAdminRequest) => createAdminMutation.run(payload),
    [createAdminMutation.run]
  );
  const updateUser = useCallback(
    (id: string, payload: UpdateAdminInfoRequest) => updateUserMutation.run({ id, payload }),
    [updateUserMutation.run]
  );
  const deleteAdmin = useCallback(
    (id: string) => deleteAdminMutation.run(id),
    [deleteAdminMutation.run]
  );
  const toggleActive = useCallback(
    (id: string, isActive: boolean) => toggleActiveMutation.run({ id, isActive }),
    [toggleActiveMutation.run]
  );

  const submitting =
    createAdminMutation.submitting ||
    updateUserMutation.submitting ||
    deleteAdminMutation.submitting ||
    toggleActiveMutation.submitting;

  return useMemo(
    () => ({
      users,
      loading: query.isLoading,
      submitting,
      error,
      refresh,
      createAdmin,
      updateUser,
      deleteAdmin,
      toggleActive
    }),
    [
      users,
      query.isLoading,
      submitting,
      error,
      refresh,
      createAdmin,
      updateUser,
      deleteAdmin,
      toggleActive
    ]
  );
};
