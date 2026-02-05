"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { featuredPostApi, uploadApi } from "@/lib";
import type {
  FeaturedPostDto,
  CreateFeaturedPostRequest,
  UpdateFeaturedPostRequest,
} from "@/core/application/dtos";

type ListState = {
  list: FeaturedPostDto[];
  isLoading: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  error: string;
};

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useFeaturedPosts = (
  options: { activeOnly?: boolean; autoLoad?: boolean } = {}
) => {
  const { activeOnly = false, autoLoad = true } = options;

  const [state, setState] = useState<ListState>({
    list: [],
    isLoading: false,
    isSubmitting: false,
    isUploading: false,
    error: "",
  });

  const hasLoadedRef = useRef(false);

  const setError = (msg: string) =>
    setState((p) => ({ ...p, error: msg || "" }));

  const refresh = useCallback(async () => {
    setState((p) => ({ ...p, isLoading: true, error: "" }));

    try {
      const res = await featuredPostApi.getAll();

      const posts: FeaturedPostDto[] = 
        (res as { posts?: FeaturedPostDto[] })?.posts ?? 
        (res as { data?: FeaturedPostDto[] })?.data ?? 
        [];

      const filtered = activeOnly
        ? posts.filter((x) => x.isActive !== false)
        : posts;

      setState((p) => ({
        ...p,
        list: filtered,
        isLoading: false,
      }));
    } catch (err) {
      setState((p) => ({
        ...p,
        isLoading: false,
        error: getErrMsg(err, "فشل في جلب البيانات"),
      }));
    }
  }, [activeOnly]);

  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [autoLoad, refresh]);

  const uploadImage = useCallback(async (file: File) => {
    setState((p) => ({ ...p, isUploading: true, error: "" }));

    try {
      const res = await uploadApi.uploadFeaturedImage(file);

      const imageUrl = (res as { data?: { imageUrl?: string } })?.data?.imageUrl;
      const success = (res as { success?: boolean })?.success;
      
      if (!success || !imageUrl) {
        throw new Error((res as { error?: string })?.error || "فشل رفع الصورة");
      }

      return imageUrl;
    } catch (err) {
      setError(getErrMsg(err, "فشل رفع الصورة"));
      return null;
    } finally {
      setState((p) => ({ ...p, isUploading: false }));
    }
  }, []);

  const create = useCallback(
    async (payload: CreateFeaturedPostRequest) => {
      setState((p) => ({ ...p, isSubmitting: true, error: "" }));

      try {
        const res = await featuredPostApi.create(payload);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الإنشاء");
          return false;
        }

        await refresh();
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الإنشاء"));
        return false;
      } finally {
        setState((p) => ({ ...p, isSubmitting: false }));
      }
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: UpdateFeaturedPostRequest) => {
      setState((p) => ({ ...p, isSubmitting: true, error: "" }));

      try {
        const res = await featuredPostApi.update(id, payload);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في التحديث");
          return false;
        }

        await refresh();
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في التحديث"));
        return false;
      } finally {
        setState((p) => ({ ...p, isSubmitting: false }));
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, isSubmitting: true, error: "" }));

      try {
        const res = await featuredPostApi.delete(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الحذف");
          return false;
        }

        await refresh();
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الحذف"));
        return false;
      } finally {
        setState((p) => ({ ...p, isSubmitting: false }));
      }
    },
    [refresh]
  );

  return {
    list: state.list,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    isUploading: state.isUploading,
    error: state.error,

    refresh,
    uploadImage,
    create,
    update,
    remove,
  };
};