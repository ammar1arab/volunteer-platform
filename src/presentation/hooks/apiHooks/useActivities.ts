"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { activityApi, uploadApi } from "@/lib";
import type {
  ActivityDto,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@/core/application/dtos";

type ListState = {
  list: ActivityDto[];
  loading: boolean;
  submitting: boolean;
  uploading: boolean;
  error: string;
};

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export type ActivitiesFilter = "all" | "published";

export const useActivities = (opts?: { filter?: ActivitiesFilter }) => {
  const filter = opts?.filter ?? "all";

  const [state, setState] = useState<ListState>({
    list: [],
    loading: false,
    submitting: false,
    uploading: false,
    error: "",
  });

  const hasLoadedRef = useRef(false);

  const setError = (msg: string) =>
    setState((p) => ({ ...p, error: msg || "" }));

  const refresh = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: "" }));

    try {
      const res =
        filter === "published"
          ? await activityApi.getPublished()
          : await activityApi.getAll();

      const activities: ActivityDto[] =
        (res as { data?: { activities?: ActivityDto[] } })?.data?.activities ?? [];

      setState((p) => ({
        ...p,
        list: activities,
        loading: false,
      }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب البيانات"),
      }));
    }
  }, [filter]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [refresh]);

  const uploadImage = useCallback(async (file: File) => {
    setState((p) => ({ ...p, uploading: true, error: "" }));

    try {
      const res = await uploadApi.uploadActivityImage(file);
      const imageUrl = (res as { data?: { imageUrl?: string } })?.data?.imageUrl;
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
    async (payload: CreateActivityRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await activityApi.create(payload);

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
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: UpdateActivityRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await activityApi.update(id, payload);

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
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await activityApi.delete(id);

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
    [refresh]
  );

  const publish = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await activityApi.publish(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في النشر");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في النشر"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh]
  );

  const cancel = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await activityApi.cancel(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الإلغاء");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الإلغاء"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh]
  );

  const restore = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await activityApi.restore(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الاستعادة");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الاستعادة"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh]
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
    publish,
    cancel,
    restore,
  };
};

// ✅ ADD THIS - Activity Details Hook
export const useActivityDetails = (id: string) => {
  const [activity, setActivity] = useState<ActivityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchActivity = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await activityApi.getOne(id);
        if (cancelled) return;

        const activityData: ActivityDto | null =
          (res as { data?: { activity?: ActivityDto } })?.data?.activity ?? null;

        setActivity(activityData);

        if (!activityData) {
          setError("النشاط غير موجود");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrMsg(err, "فشل في جلب النشاط"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchActivity();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { activity, loading, error };
};