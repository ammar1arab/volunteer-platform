"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MonthlyMagazineDto,
  CreateMonthlyMagazineRequest,
  UpdateMonthlyMagazineRequest
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";
import { monthlyMagazineApi, uploadApi } from "@/presentation/services";

type ListState = {
  list: MonthlyMagazineDto[];
  loading: boolean;
  submitting: boolean;
  uploading: boolean;
  error: string;
};

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useMonthlyMagazines = (options: { activeOnly?: boolean; autoLoad?: boolean } = {}) => {
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
    logger.info("useMonthlyMagazines", "refresh-start", { activeOnly });
    setState((p) => ({ ...p, loading: true, error: "" }));

    try {
      const res = await monthlyMagazineApi.getAll();
      const magazines: MonthlyMagazineDto[] =
        (res as { data?: { magazines?: MonthlyMagazineDto[] } })?.data?.magazines ?? [];

      logger.info("useMonthlyMagazines", "api-response", {
        totalMagazines: magazines.length,
        activeOnly
      });

      const filtered = activeOnly ? magazines.filter((x) => x.isActive !== false) : magazines;

      logger.info("useMonthlyMagazines", "filtered-result", {
        total: magazines.length,
        filtered: filtered.length
      });

      setState((p) => ({ ...p, list: filtered, loading: false }));
    } catch (err) {
      logger.error("useMonthlyMagazines", "refresh-failed", getErrMsg(err));
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب البيانات")
      }));
    }
  }, [activeOnly]);

  useEffect(() => {
    logger.info("useMonthlyMagazines", "effect-triggered", {
      autoLoad,
      hasLoaded: hasLoadedRef.current
    });

    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [autoLoad, refresh]);

  const uploadPdf = useCallback(async (file: File) => {
    setState((p) => ({ ...p, uploading: true, error: "" }));
    try {
      const res = await fetch(`/api/uploads/magazines/presign?fileName=${encodeURIComponent(file.name)}`);
      const { data } = await res.json();
      await fetch(data.presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": "application/pdf" } });
      setState((p) => ({ ...p, uploading: false }));
      return data.publicUrl;
    } catch (err) {
      setError(getErrMsg(err, "فشل رفع الملف"));
      setState((p) => ({ ...p, uploading: false }));
      return null;
    }
  }, []);

  const create = useCallback(
    async (payload: CreateMonthlyMagazineRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await monthlyMagazineApi.create(payload);

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
    async (id: string, payload: UpdateMonthlyMagazineRequest) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await monthlyMagazineApi.update(id, payload);

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
        const res = await monthlyMagazineApi.delete(id);

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
    uploadPdf,
    create,
    update,
    remove
  };
};

export const useMagazineDetails = (id: string) => {
  const [magazine, setMagazine] = useState<MonthlyMagazineDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchMagazine = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await monthlyMagazineApi.getOne(id);
        if (cancelled) return;

        const data: MonthlyMagazineDto | null =
          (res as { data?: { magazine?: MonthlyMagazineDto } })?.data?.magazine ?? null;

        setMagazine(data);

        if (!data) setError("المجلة غير موجودة");
      } catch (err) {
        if (!cancelled) setError(getErrMsg(err, "فشل في جلب المجلة"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMagazine();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { magazine, loading, error };
};
