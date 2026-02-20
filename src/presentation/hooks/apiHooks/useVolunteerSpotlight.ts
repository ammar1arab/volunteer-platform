"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VolunteerSpotlightDto, CreateVolunteerSpotlightRequest, UpdateVolunteerSpotlightRequest } from "@/core/application/dtos";
import { logger } from "@/lib/utils";
import { volunteerSpotlightApi, uploadApi } from "@/presentation/services";

type ListState = {
  list: VolunteerSpotlightDto[];
  loading: boolean;
  submitting: boolean;
  uploading: boolean;
  error: string;
};

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useVolunteerSpotlight = (options: { activeOnly?: boolean; autoLoad?: boolean } = {}) => {
  const { activeOnly = false, autoLoad = true } = options;

  const [state, setState] = useState<ListState>({
    list: [],
    loading: true,
    submitting: false,
    uploading: false,
    error: ""
  });

  const hasLoadedRef = useRef(false);

  const setError = (msg: string) => setState((p) => ({ ...p, error: msg || "" }));

  const refresh = useCallback(async () => {
    logger.info("useVolunteerSpotlight", "refresh-start", { activeOnly });
    setState((p) => ({ ...p, loading: true, error: "" }));

    try {
      const res = await volunteerSpotlightApi.getAll();
      const spotlights: VolunteerSpotlightDto[] = (res as { data?: { volunteerSpotlights?: VolunteerSpotlightDto[] } })?.data?.volunteerSpotlights ?? [];

      logger.info("useVolunteerSpotlight", "api-response", {
        totalSpotlights: spotlights.length,
        activeOnly
      });

      const filtered = activeOnly ? spotlights.filter((x) => x.isActive !== false) : spotlights;

      logger.info("useVolunteerSpotlight", "filtered-result", {
        total: spotlights.length,
        filtered: filtered.length
      });

      setState((p) => ({
        ...p,
        list: filtered,
        loading: false
      }));
    } catch (err) {
      logger.error("useVolunteerSpotlight", "refresh-failed", getErrMsg(err));
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب البيانات")
      }));
    }
  }, [activeOnly]);

  useEffect(() => {
    logger.info("useVolunteerSpotlight", "effect-triggered", {
      autoLoad,
      hasLoaded: hasLoadedRef.current
    });

    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [autoLoad, refresh]);

  const uploadImage = useCallback(async (file: File) => {
    setState((p) => ({ ...p, uploading: true, error: "" }));

    try {
      const res = await uploadApi.uploadVolunteerSpotlightImage(file);
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
    async (payload: CreateVolunteerSpotlightRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await volunteerSpotlightApi.create(payload);

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
    async (id: string, payload: UpdateVolunteerSpotlightRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await volunteerSpotlightApi.update(id, payload);

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
        const res = await volunteerSpotlightApi.delete(id);

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
    remove
  };
};

export const useSpotlightDetails = (id: string) => {
  const [spotlight, setSpotlight] = useState<VolunteerSpotlightDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSpotlight = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await volunteerSpotlightApi.getOne(id);
        if (cancelled) return;

        const data: VolunteerSpotlightDto | null = (res as { data?: { volunteerSpotlight?: VolunteerSpotlightDto } })?.data?.volunteerSpotlight ?? null;

        setSpotlight(data);

        if (!data) {
          setError("المتطوع غير موجود");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrMsg(err, "فشل في جلب المتطوع"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSpotlight();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { spotlight, loading, error };
};