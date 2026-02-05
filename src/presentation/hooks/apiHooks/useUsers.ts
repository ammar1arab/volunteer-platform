"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { userApi } from "@/lib";
import type { UserAnalyticsDto } from "@/core/application/dtos";

interface UsersState {
  users: UserAnalyticsDto[];
  isLoading: boolean;
  error: string;
}

export const useUsers = (options: { autoLoad?: boolean } = {}) => {
  const { autoLoad = true } = options;

  const [state, setState] = useState<UsersState>({
    users: [],
    isLoading: false,
    error: "",
  });

  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setState((p) => ({ ...p, isLoading: true, error: "" }));

    try {
      const result = await userApi.getAll();

      if (!result.success || !result.users) {
        setState((p) => ({
          ...p,
          isLoading: false,
          error: result.error || "فشل في جلب المستخدمين",
        }));
        return;
      }

      setState((p) => ({
        ...p,
        users: result.users || [],
        isLoading: false,
      }));
    } catch (error) {
      setState((p) => ({
        ...p,
        isLoading: false,
        error: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
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
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
};