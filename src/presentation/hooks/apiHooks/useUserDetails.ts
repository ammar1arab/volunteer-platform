"use client";

import { useCallback, useEffect, useState } from "react";
import { userApi } from "@/lib";
import type { UserAnalyticsDto, UserActivityDto } from "@/core/application/dtos";

interface UserDetailsState {
  user: UserAnalyticsDto | null;
  activities: UserActivityDto[];
  isLoadingUser: boolean;
  isLoadingActivities: boolean;
  error: string;
}

export const useUserDetails = (userId: string) => {
  const [state, setState] = useState<UserDetailsState>({
    user: null,
    activities: [],
    isLoadingUser: false,
    isLoadingActivities: false,
    error: "",
  });

  const loadUser = useCallback(async () => {
    setState((p) => ({ ...p, isLoadingUser: true, error: "" }));

    try {
      const result = await userApi.getById(userId);

      if (!result.success || !result.user) {
        setState((p) => ({
          ...p,
          isLoadingUser: false,
          error: result.error || "فشل في جلب بيانات المستخدم",
        }));
        return;
      }

      setState((p) => ({
        ...p,
        user: result.user || null,
        isLoadingUser: false,
      }));
    } catch (error) {
      setState((p) => ({
        ...p,
        isLoadingUser: false,
        error: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      }));
    }
  }, [userId]);

  const loadActivities = useCallback(async () => {
    setState((p) => ({ ...p, isLoadingActivities: true }));

    try {
      const result = await userApi.getActivities(userId);

      if (!result.success || !result.activities) {
        setState((p) => ({
          ...p,
          isLoadingActivities: false,
        }));
        return;
      }

      setState((p) => ({
        ...p,
        activities: result.activities || [],
        isLoadingActivities: false,
      }));
    } catch {
      setState((p) => ({
        ...p,
        isLoadingActivities: false,
      }));
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
    loadActivities();
  }, [loadUser, loadActivities]);

  return {
    user: state.user,
    activities: state.activities,
    isLoadingUser: state.isLoadingUser,
    isLoadingActivities: state.isLoadingActivities,
    error: state.error,
    refresh: () => {
      loadUser();
      loadActivities();
    },
  };
};