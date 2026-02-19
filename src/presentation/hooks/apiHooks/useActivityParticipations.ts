"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityParticipationDto } from "@/core/application/dtos";
import { participationApi } from "@/presentation/services";

type RequestType = "my-requests" | "pending";

interface ParticipationsState {
  requests: ActivityParticipationDto[];
  loading: boolean;
  submitting: boolean;
  error: string;
}

interface UseActivityParticipationsOptions {
  autoFetch?: boolean;
  type?: RequestType;
}

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useActivityParticipations = (options: UseActivityParticipationsOptions = {}) => {
  const { autoFetch = false, type = "my-requests" } = options;

  const [state, setState] = useState<ParticipationsState>({
    requests: [],
    loading: false,
    submitting: false,
    error: ""
  });

  const hasLoadedRef = useRef(false);

  const setError = (msg: string) => setState((p) => ({ ...p, error: msg || "" }));

  const refresh = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: "" }));

    try {
      const res = type === "pending" ? await participationApi.getPending() : await participationApi.getMyRequests();

      const requests: ActivityParticipationDto[] =
        (res as { data?: { requests?: ActivityParticipationDto[] } })?.data?.requests ?? [];

      setState((p) => ({
        ...p,
        requests,
        loading: false
      }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب البيانات")
      }));
    }
  }, [type]);

  useEffect(() => {
    if (autoFetch && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [autoFetch, refresh]);

  const createRequest = useCallback(
    async (activityId: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await participationApi.create(activityId);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في إنشاء الطلب");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في إنشاء الطلب"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh]
  );

  const approve = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await participationApi.approve(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الموافقة");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الموافقة"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh]
  );

  const reject = useCallback(
    async (id: string) => {
      setState((p) => ({ ...p, submitting: true, error: "" }));

      try {
        const res = await participationApi.reject(id);

        if (!(res as { success?: boolean })?.success) {
          setError((res as { error?: string })?.error || "فشل في الرفض");
          setState((p) => ({ ...p, submitting: false }));
          return false;
        }

        await refresh();
        setState((p) => ({ ...p, submitting: false }));
        return true;
      } catch (err) {
        setError(getErrMsg(err, "فشل في الرفض"));
        setState((p) => ({ ...p, submitting: false }));
        return false;
      }
    },
    [refresh]
  );

  const getRequestForActivity = useCallback(
    (activityId: string) => state.requests.find((r) => r.activityId === activityId),
    [state.requests]
  );

  return {
    requests: state.requests,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,
    refresh,
    createRequest,
    approve,
    reject,
    getRequestForActivity
  };
};
