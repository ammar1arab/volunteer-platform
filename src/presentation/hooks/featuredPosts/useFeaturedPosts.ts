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
      const res: any = await featuredPostApi.getAll();

      const posts: FeaturedPostDto[] = res?.posts ?? res?.data ?? [];

      const filtered = activeOnly
        ? posts.filter((x) => x.isActive !== false)
        : posts;

      setState((p) => ({
        ...p,
        list: filtered,
        isLoading: false,
      }));
    } catch (err: unknown) {
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
      const res: any = await uploadApi.uploadFeaturedImage(file);

      const imageUrl = res?.data?.imageUrl;
      if (!res?.success || !imageUrl) {
        throw new Error(res?.error || "فشل رفع الصورة");
      }

      return imageUrl as string;
    } catch (err: unknown) {
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
        const res: any = await featuredPostApi.create(payload);

        if (!res?.success) {
          setError(res?.error || "فشل في الإنشاء");
          return false;
        }

        await refresh();
        return true;
      } catch (err: unknown) {
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
        const res: any = await featuredPostApi.update(id, payload);

        if (!res?.success) {
          setError(res?.error || "فشل في التحديث");
          return false;
        }

        await refresh();
        return true;
      } catch (err: unknown) {
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
        const res: any = await featuredPostApi.delete(id);

        if (!res?.success) {
          setError(res?.error || "فشل في الحذف");
          return false;
        }

        await refresh();
        return true;
      } catch (err: unknown) {
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
