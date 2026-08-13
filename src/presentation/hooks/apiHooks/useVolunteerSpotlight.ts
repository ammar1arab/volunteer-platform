"use client";

import { useCallback, useMemo } from "react";
import type {
  VolunteerSpotlightDto,
  CreateVolunteerSpotlightRequest,
  UpdateVolunteerSpotlightRequest
} from "@/core/application/dtos";
import { volunteerSpotlightApi, uploadApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

export const useVolunteerSpotlight = (
  options: { activeOnly?: boolean; enabled?: boolean; autoLoad?: boolean } = {}
) => {
  const { activeOnly = false } = options;
  const enabled = options.enabled ?? options.autoLoad ?? true;

  const query = useFetchData<VolunteerSpotlightDto[]>({
    queryKey: queryKeys.spotlights.list(activeOnly),
    request: async () => {
      const spotlights = unwrapResult(await volunteerSpotlightApi.getAll()).volunteerSpotlights;
      return activeOnly ? spotlights.filter((x) => x.isActive !== false) : spotlights;
    },
    options: { enabled, staleTime: activeOnly ? 60_000 : 30_000, keepPrevious: true }
  });

  const createMutation = useBooleanMutation<CreateVolunteerSpotlightRequest>({
    request: async (payload) => unwrapResult(await volunteerSpotlightApi.create(payload)),
    invalidateQueries: queryKeys.spotlights.all,
    fallbackError: "فشل في الإنشاء"
  });

  const updateMutation = useBooleanMutation<{
    id: string;
    payload: UpdateVolunteerSpotlightRequest;
  }>({
    request: async ({ id, payload }) => unwrapResult(await volunteerSpotlightApi.update(id, payload)),
    invalidateQueries: queryKeys.spotlights.all,
    fallbackError: "فشل في التحديث"
  });

  const removeMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await volunteerSpotlightApi.delete(id)),
    invalidateQueries: queryKeys.spotlights.all,
    fallbackError: "فشل في الحذف"
  });

  const uploadMutation = useApiMutation<string, File>({
    request: async (file) =>
      unwrapResult(await uploadApi.uploadVolunteerSpotlightImage(file)).imageUrl
  });

  const list = (query.data ?? EMPTY_ARRAY) as VolunteerSpotlightDto[];
  const mutationError =
    createMutation.error ||
    updateMutation.error ||
    removeMutation.error ||
    (uploadMutation.error ? getErrorMessage(uploadMutation.error, "فشل رفع الصورة") : "");
  const queryError = query.error ? getErrorMessage(query.error, "فشل في جلب البيانات") : "";
  const refetch = query.refetch;
  const uploadAsync = uploadMutation.mutateAsync;

  const uploadImage = useCallback(async (file: File) => {
    try {
      return await uploadAsync(file);
    } catch {
      return null;
    }
  }, [uploadAsync]);

  const create = useCallback(
    (payload: CreateVolunteerSpotlightRequest) => createMutation.run(payload),
    [createMutation.run]
  );
  const update = useCallback(
    (id: string, payload: UpdateVolunteerSpotlightRequest) => updateMutation.run({ id, payload }),
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
      uploadImage,
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
      uploadImage,
      create,
      update,
      remove
    ]
  );
};

export const useSpotlightDetails = (id: string) => {
  const query = useFetchData<VolunteerSpotlightDto>({
    queryKey: queryKeys.spotlights.detail(id),
    request: async () => unwrapResult(await volunteerSpotlightApi.getOne(id)).volunteerSpotlight,
    options: { enabled: Boolean(id), staleTime: 60_000 }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      spotlight: query.data ?? null,
      loading: query.isLoading,
      error: query.error
        ? getErrorMessage(query.error, "فشل في جلب المتطوع")
        : !query.isLoading && query.isFetched && !query.data
          ? "المتطوع غير موجود"
          : "",
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.error, query.isFetched, refetch]
  );
};
