"use client";

import { useCallback, useMemo } from "react";
import type {
  MonthlyMagazineDto,
  CreateMonthlyMagazineRequest,
  UpdateMonthlyMagazineRequest
} from "@/core/application/dtos";
import { monthlyMagazineApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

interface MagazinePresignResponse {
  data: { presignedUrl: string; publicUrl: string };
}

export const useMonthlyMagazines = (
  options: { activeOnly?: boolean; enabled?: boolean; autoLoad?: boolean } = {}
) => {
  const { activeOnly = false } = options;
  const enabled = options.enabled ?? options.autoLoad ?? true;

  const query = useFetchData<MonthlyMagazineDto[]>({
    queryKey: queryKeys.magazines.list(activeOnly),
    request: async () => {
      const magazines = unwrapResult(await monthlyMagazineApi.getAll()).magazines;
      return activeOnly ? magazines.filter((x) => x.isActive !== false) : magazines;
    },
    options: { enabled, staleTime: activeOnly ? 60_000 : 30_000, keepPrevious: true }
  });

  const createMutation = useBooleanMutation<CreateMonthlyMagazineRequest>({
    request: async (payload) => unwrapResult(await monthlyMagazineApi.create(payload)),
    invalidateQueries: queryKeys.magazines.all,
    fallbackError: "فشل في الإنشاء"
  });

  const updateMutation = useBooleanMutation<{ id: string; payload: UpdateMonthlyMagazineRequest }>({
    request: async ({ id, payload }) => unwrapResult(await monthlyMagazineApi.update(id, payload)),
    invalidateQueries: queryKeys.magazines.all,
    fallbackError: "فشل في التحديث"
  });

  const removeMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await monthlyMagazineApi.delete(id)),
    invalidateQueries: queryKeys.magazines.all,
    fallbackError: "فشل في الحذف"
  });

  const uploadMutation = useApiMutation<string, File>({
    request: async (file) => {
      const res = await fetch(`/api/uploads/magazines/presign?fileName=${encodeURIComponent(file.name)}`);
      if (!res.ok) throw new Error("فشل رفع الملف");
      const json = (await res.json()) as MagazinePresignResponse;
      const put = await fetch(json.data.presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" }
      });
      if (!put.ok) throw new Error("فشل رفع الملف");
      return json.data.publicUrl;
    }
  });

  const list = (query.data ?? EMPTY_ARRAY) as MonthlyMagazineDto[];
  const mutationError =
    createMutation.error ||
    updateMutation.error ||
    removeMutation.error ||
    (uploadMutation.error ? getErrorMessage(uploadMutation.error, "فشل رفع الملف") : "");
  const queryError = query.error ? getErrorMessage(query.error, "فشل في جلب البيانات") : "";
  const refetch = query.refetch;
  const uploadAsync = uploadMutation.mutateAsync;

  const uploadPdf = useCallback(async (file: File) => {
    try {
      return await uploadAsync(file);
    } catch {
      return null;
    }
  }, [uploadAsync]);

  const create = useCallback(
    (payload: CreateMonthlyMagazineRequest) => createMutation.run(payload),
    [createMutation.run]
  );
  const update = useCallback(
    (id: string, payload: UpdateMonthlyMagazineRequest) => updateMutation.run({ id, payload }),
    [updateMutation.run]
  );
  const remove = useCallback((id: string) => removeMutation.run(id), [removeMutation.run]);
  const refresh = useCallback(() => refetch(), [refetch]);
  const submitting =
    createMutation.submitting || updateMutation.submitting || removeMutation.submitting;

  return useMemo(
    () => ({
      list,
      loading: query.isLoading,
      submitting,
      uploading: uploadMutation.isPending,
      error: queryError || mutationError,
      refresh,
      uploadPdf,
      create,
      update,
      remove
    }),
    [
      list,
      query.isLoading,
      submitting,
      uploadMutation.isPending,
      queryError,
      mutationError,
      refresh,
      uploadPdf,
      create,
      update,
      remove
    ]
  );
};

export const useMagazineDetails = (id: string) => {
  const query = useFetchData<MonthlyMagazineDto>({
    queryKey: queryKeys.magazines.detail(id),
    request: async () => unwrapResult(await monthlyMagazineApi.getOne(id)).magazine,
    options: { enabled: Boolean(id), staleTime: 60_000 }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      magazine: query.data ?? null,
      loading: query.isLoading,
      error: query.error
        ? getErrorMessage(query.error, "فشل في جلب المجلة")
        : !query.isLoading && query.isFetched && !query.data
          ? "المجلة غير موجودة"
          : "",
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.error, query.isFetched, refetch]
  );
};
