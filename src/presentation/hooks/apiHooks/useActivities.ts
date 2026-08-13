"use client";

import { useCallback, useMemo } from "react";
import type { ActivityDto, CreateActivityRequest, UpdateActivityRequest } from "@/core/application/dtos";
import { activityApi, uploadApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

export type ActivitiesFilter = "all" | "published";

export const useActivities = (opts?: { filter?: ActivitiesFilter; enabled?: boolean }) => {
  const filter = opts?.filter ?? "all";

  const query = useFetchData<ActivityDto[]>({
    queryKey: queryKeys.activities.list(filter),
    request: async () => {
      const res = filter === "published" ? await activityApi.getPublished() : await activityApi.getAll();
      return unwrapResult(res).activities;
    },
    options: {
      enabled: opts?.enabled ?? true,
      staleTime: filter === "published" ? 60_000 : 30_000,
      keepPrevious: true
    }
  });

  const createMutation = useBooleanMutation<CreateActivityRequest>({
    request: async (payload) => unwrapResult(await activityApi.create(payload)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في الإنشاء"
  });

  const updateMutation = useBooleanMutation<{ id: string; payload: UpdateActivityRequest }>({
    request: async ({ id, payload }) => unwrapResult(await activityApi.update(id, payload)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في التحديث"
  });

  const removeMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await activityApi.delete(id)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في الحذف"
  });

  const publishMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await activityApi.publish(id)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في النشر"
  });

  const cancelMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await activityApi.cancel(id)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في الإلغاء"
  });

  const restoreMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await activityApi.restore(id)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في الاستعادة"
  });

  const completeMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await activityApi.complete(id)),
    invalidateQueries: queryKeys.activities.all,
    fallbackError: "فشل في إكمال النشاط"
  });

  const uploadMutation = useApiMutation<string, File>({
    request: async (file) => unwrapResult(await uploadApi.uploadActivityImage(file)).imageUrl
  });

  const list = (query.data ?? EMPTY_ARRAY) as ActivityDto[];
  const mutationError =
    createMutation.error ||
    updateMutation.error ||
    removeMutation.error ||
    publishMutation.error ||
    cancelMutation.error ||
    restoreMutation.error ||
    completeMutation.error ||
    (uploadMutation.error ? getErrorMessage(uploadMutation.error, "فشل رفع الصورة") : "");

  const queryError = query.error ? getErrorMessage(query.error, "فشل في جلب البيانات") : "";
  const refetch = query.refetch;
  const uploadAsync = uploadMutation.mutateAsync;

  const uploadImage = useCallback(
    async (file: File) => {
      try {
        return await uploadAsync(file);
      } catch {
        return null;
      }
    },
    [uploadAsync]
  );

  const create = useCallback(
    (payload: CreateActivityRequest) => createMutation.run(payload),
    [createMutation.run]
  );
  const update = useCallback(
    (id: string, payload: UpdateActivityRequest) => updateMutation.run({ id, payload }),
    [updateMutation.run]
  );
  const remove = useCallback((id: string) => removeMutation.run(id), [removeMutation.run]);
  const publish = useCallback((id: string) => publishMutation.run(id), [publishMutation.run]);
  const cancel = useCallback((id: string) => cancelMutation.run(id), [cancelMutation.run]);
  const restore = useCallback((id: string) => restoreMutation.run(id), [restoreMutation.run]);
  const complete = useCallback((id: string) => completeMutation.run(id), [completeMutation.run]);
  const refresh = useCallback(() => refetch(), [refetch]);

  const submitting =
    createMutation.submitting ||
    updateMutation.submitting ||
    removeMutation.submitting ||
    publishMutation.submitting ||
    cancelMutation.submitting ||
    restoreMutation.submitting ||
    completeMutation.submitting;

  return useMemo(
    () => ({
      list,
      loading: query.isLoading,
      submitting,
      uploading: uploadMutation.isPending,
      error: queryError || mutationError,
      refresh,
      uploadImage,
      create,
      update,
      remove,
      publish,
      cancel,
      restore,
      complete
    }),
    [
      list,
      query.isLoading,
      submitting,
      uploadMutation.isPending,
      queryError,
      mutationError,
      refresh,
      uploadImage,
      create,
      update,
      remove,
      publish,
      cancel,
      restore,
      complete
    ]
  );
};

export const useActivityDetails = (id: string) => {
  const query = useFetchData<ActivityDto>({
    queryKey: queryKeys.activities.detail(id),
    request: async () => unwrapResult(await activityApi.getOne(id)).activity,
    options: { enabled: Boolean(id), staleTime: 30_000 }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      activity: query.data ?? null,
      loading: query.isLoading,
      error: query.error
        ? getErrorMessage(query.error, "فشل في جلب النشاط")
        : !query.isLoading && query.isFetched && !query.data
          ? "النشاط غير موجود"
          : "",
      isNotFound: query.isNotFound || (query.isFetched && !query.data && !query.error),
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.error, query.isFetched, query.isNotFound, refetch]
  );
};
