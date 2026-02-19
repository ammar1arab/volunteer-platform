"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UserAnalyticsDto } from "@/core/application/dtos";
import { userApi } from "@/presentation/services";

interface UsersState {
  users: UserAnalyticsDto[];
  loading: boolean;
  error: string;
}

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useUsers = (options: { autoLoad?: boolean } = {}) => {
  const { autoLoad = true } = options;

  const [state, setState] = useState<UsersState>({
    users: [],
    loading: false,
    error: "",
  });

  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: "" }));

    try {
      const res = await userApi.getAll();

      const users: UserAnalyticsDto[] =
        (res as { data?: { users?: UserAnalyticsDto[] } })?.data?.users ?? [];

      setState((p) => ({
        ...p,
        users,
        loading: false,
      }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب المستخدمين"),
      }));
    }
  }, []);

  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    users: state.users,
    loading: state.loading,
    error: state.error,
    refresh,
  };
};