"use client";

import { useCallback, useEffect, useState } from "react";
import { UserAnalyticsDto, UserActivityDto } from "@/core/application/dtos";
import { userApi } from "@/presentation/services";

interface UserDetailsState {
  user: UserAnalyticsDto | null;
  activities: UserActivityDto[];
  loadingUser: boolean;
  loadingActivities: boolean;
  error: string;
}

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useUserDetails = (userId: string) => {
  const [state, setState] = useState<UserDetailsState>({
    user: null,
    activities: [],
    loadingUser: false,
    loadingActivities: false,
    error: "",
  });

  const loadUser = useCallback(async () => {
    setState((p) => ({ ...p, loadingUser: true, error: "" }));

    try {
      const res = await userApi.getById(userId);

      const user: UserAnalyticsDto | null =
        (res as { data?: { user?: UserAnalyticsDto } })?.data?.user ?? null;

      setState((p) => ({
        ...p,
        user,
        loadingUser: false,
      }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loadingUser: false,
        error: getErrMsg(err, "فشل في جلب بيانات المستخدم"),
      }));
    }
  }, [userId]);

  const loadActivities = useCallback(async () => {
    setState((p) => ({ ...p, loadingActivities: true }));

    try {
      const res = await userApi.getActivities(userId);

      const activities: UserActivityDto[] =
        (res as { data?: { activities?: UserActivityDto[] } })?.data?.activities ?? [];

      setState((p) => ({
        ...p,
        activities,
        loadingActivities: false,
      }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loadingActivities: false,
        error: getErrMsg(err, "فشل في جلب الفرص"),
      }));
    }
  }, [userId]);

  const refresh = useCallback(() => {
    loadUser();
    loadActivities();
  }, [loadUser, loadActivities]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    user: state.user,
    activities: state.activities,
    loadingUser: state.loadingUser,
    loadingActivities: state.loadingActivities,
    error: state.error,
    refresh,
  };
};