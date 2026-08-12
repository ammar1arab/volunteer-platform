"use client";

import { useCallback, useMemo } from "react";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import { userApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useFetchData
} from "@/presentation/query";

export const useUsers = (options: { enabled?: boolean; autoLoad?: boolean } = {}) => {
  const enabled = options.enabled ?? options.autoLoad ?? true;

  const query = useFetchData<UserAnalyticsDto[]>({
    queryKey: queryKeys.users.list(),
    request: async () => unwrapResult(await userApi.getAll()).users,
    options: { enabled, staleTime: 45_000 }
  });

  const refetch = query.refetch;
  const users = (query.data ?? EMPTY_ARRAY) as UserAnalyticsDto[];
  const error = query.error ? getErrorMessage(query.error, "فشل في جلب المستخدمين") : "";
  const refresh = useCallback(() => refetch(), [refetch]);

  return useMemo(
    () => ({
      users,
      loading: query.isLoading,
      error,
      refresh
    }),
    [users, query.isLoading, error, refresh]
  );
};
