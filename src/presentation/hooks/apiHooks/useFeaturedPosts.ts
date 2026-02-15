"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { featuredPostApi, uploadApi } from "@/lib";
import type {
  FeaturedPostDto,
  CreateFeaturedPostRequest,
  UpdateFeaturedPostRequest,
} from "@/core/application/dtos";
import { logger } from "@/core/application/helpers";

type ListState = {
  list: FeaturedPostDto[];
  loading: boolean;
  submitting: boolean;
  uploading: boolean;
  error: string;
};

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useFeaturedPosts = (
  options: { activeOnly?: boolean; autoLoad?: boolean } = {},
) => {
  const { activeOnly = false, autoLoad = true } = options;

  const [state, setState] = useState<ListState>({
    list: [],
    loading: true,
    submitting: false,
    uploading: false,
    error: "",
  });

  const hasLoadedRef = useRef(false);

  const setError = (msg: string) =>
    setState((p) => ({ ...p, error: msg || "" }));

  const refresh = useCallback(async () => {
    logger.info("useFeaturedPosts", "refresh-start", { activeOnly });
    setState((p) => ({ ...p, loading: true, error: "" }));

    try {
      const res = await featuredPostApi.getAll();
      const posts: FeaturedPostDto[] =
        (res as { data?: { posts?: FeaturedPostDto[] } })?.data?.posts ?? [];

      logger.info("useFeaturedPosts", "api-response", {
        totalPosts: posts.length,
        activeOnly,
      });

      const filtered = activeOnly
        ? posts.filter((x) => x.isActive !== false)
        : posts;

      logger.info("useFeaturedPosts", "filtered-result", {
        total: posts.length,
        filtered: filtered.length,
      });

      setState((p) => ({
        ...p,
        list: filtered,
        loading: false,
      }));
    } catch (err) {
      logger.error("useFeaturedPosts", "refresh-failed", getErrMsg(err));
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب البيانات"),
      }));
    }
  }, [activeOnly]);

  useEffect(() => {
    logger.info("useFeaturedPosts", "effect-triggered", {
      autoLoad,
      hasLoaded: hasLoadedRef.current,
    });

    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [autoLoad, refresh]);

  const uploadImage = useCallback(async (file: File) => {
    setState((p) => ({ ...p, uploading: true, error: "" }));

    try {
      const res = await uploadApi.uploadFeaturedImage(file);
      const imageUrl = (res as { data?: { imageUrl?: string } })?.data
        ?.imageUrl;
      const success = (res as { success?: boolean })?.success;

      if (!success || !imageUrl) {
        throw new Error((res as { error?: string })?.error || "فشل رفع الصورة");
      }

      setState((p) => ({ ...p, uploading: false }));
      return imageUrl;
    } catch (err) {
      setError(getErrMsg(err, "فشل رفع الصورة"));
      setState((p) => ({ ...p, uploading: false }));
      return null;
    }
  }, []);

  const create = useCallback(
    async (payload: CreateFeaturedPostRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await featuredPostApi.create(payload);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الإنشاء");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الإنشاء"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, payload: UpdateFeaturedPostRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await featuredPostApi.update(id, payload);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في التحديث");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في التحديث"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await featuredPostApi.delete(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الحذف");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الحذف"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh],
  );

  return {
    list: state.list,
    loading: state.loading,
    submitting: state.submitting,
    uploading: state.uploading,
    error: state.error,
    refresh,
    uploadImage,
    create,
    update,
    remove,
  };
};

// ✅ ADD THIS - Post Details Hook
export const usePostDetails = (id: string) => {
  const [post, setPost] = useState<FeaturedPostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPost = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await featuredPostApi.getOne(id);
        if (cancelled) return;

        const postData: FeaturedPostDto | null =
          (res as { data?: { post?: FeaturedPostDto } })?.data?.post ?? null;

        setPost(postData);

        if (!postData) {
          setError("المنشور غير موجود");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrMsg(err, "فشل في جلب المنشور"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { post, loading, error };
};
