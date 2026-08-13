"use client";

import { useCallback, useMemo } from "react";
import type {
  FeaturedPostDto,
  CreateFeaturedPostRequest,
  UpdateFeaturedPostRequest
} from "@/core/application/dtos";
import { featuredPostApi, uploadApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

export const useFeaturedPosts = (
  options: { activeOnly?: boolean; enabled?: boolean; autoLoad?: boolean } = {}
) => {
  const { activeOnly = false } = options;
  const enabled = options.enabled ?? options.autoLoad ?? true;

  const query = useFetchData<FeaturedPostDto[]>({
    queryKey: queryKeys.featuredPosts.list(activeOnly),
    request: async () => {
      const posts = unwrapResult(await featuredPostApi.getAll()).posts;
      return activeOnly ? posts.filter((x) => x.isActive !== false) : posts;
    },
    options: { enabled, staleTime: activeOnly ? 60_000 : 30_000, keepPrevious: true }
  });

  const createMutation = useBooleanMutation<CreateFeaturedPostRequest>({
    request: async (payload) => unwrapResult(await featuredPostApi.create(payload)),
    invalidateQueries: queryKeys.featuredPosts.all,
    fallbackError: "فشل في الإنشاء"
  });

  const updateMutation = useBooleanMutation<{ id: string; payload: UpdateFeaturedPostRequest }>({
    request: async ({ id, payload }) => unwrapResult(await featuredPostApi.update(id, payload)),
    invalidateQueries: queryKeys.featuredPosts.all,
    fallbackError: "فشل في التحديث"
  });

  const removeMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await featuredPostApi.delete(id)),
    invalidateQueries: queryKeys.featuredPosts.all,
    fallbackError: "فشل في الحذف"
  });

  const uploadMutation = useApiMutation<string, File>({
    request: async (file) => unwrapResult(await uploadApi.uploadFeaturedImage(file)).imageUrl
  });

  const list = (query.data ?? EMPTY_ARRAY) as FeaturedPostDto[];
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
    (payload: CreateFeaturedPostRequest) => createMutation.run(payload),
    [createMutation.run]
  );
  const update = useCallback(
    (id: string, payload: UpdateFeaturedPostRequest) => updateMutation.run({ id, payload }),
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

export const usePostDetails = (id: string) => {
  const query = useFetchData<FeaturedPostDto>({
    queryKey: queryKeys.featuredPosts.detail(id),
    request: async () => unwrapResult(await featuredPostApi.getOne(id)).post,
    options: { enabled: Boolean(id), staleTime: 60_000 }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      post: query.data ?? null,
      loading: query.isLoading,
      error: query.error
        ? getErrorMessage(query.error, "فشل في جلب المنشور")
        : !query.isLoading && query.isFetched && !query.data
          ? "المنشور غير موجود"
          : "",
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.error, query.isFetched, refetch]
  );
};
