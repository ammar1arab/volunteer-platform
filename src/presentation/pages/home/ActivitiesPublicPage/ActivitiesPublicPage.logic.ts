"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import type { ActivityDto } from "@/core/application/dtos";
import {
  useActivities,
  useActivityParticipations,
  useToast,
} from "@/presentation/hooks";
import { ROUTES } from "@/presentation/constants";

export const useActivitiesPublicPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const { list: activities, loading } = useActivities({ filter: "published" });

  const { submitting, createRequest, getRequestForActivity } =
    useActivityParticipations({
      autoFetch: !!session,
    });

  const handleJoin = useCallback(
    async (activity: ActivityDto) => {
      if (!session) {
        router.push(ROUTES.LOGIN);
        return;
      }

      const success = await createRequest(activity.id);
      showToast(
        success ? "تم إرسال طلب الانضمام" : "فشل إرسال الطلب",
        success ? "success" : "error",
      );
    },
    [session, router, createRequest, showToast],
  );

  const getActionButton = useCallback(
    (activity: ActivityDto) => {
      if (!session) {
        return {
          variant: "secondary" as const,
          label: "تسجيل الدخول",
          disabled: false,
          onClick: () => router.push(ROUTES.LOGIN),
        };
      }

      const request = getRequestForActivity(activity.id);

      if (activity.isFull) {
        return {
          variant: "ghost" as const,
          label: "اكتمل العدد",
          disabled: true,
        };
      }

      if (request?.status === "PENDING") {
        return {
          variant: "ghost" as const,
          label: "قيد المراجعة",
          disabled: true,
        };
      }

      if (request?.status === "APPROVED") {
        return {
          variant: "ghost" as const,
          label: "أنت مشارك",
          disabled: true,
        };
      }

      return {
        variant: "primary" as const,
        label: "انضم الآن",
        disabled: false,
        onClick: () => handleJoin(activity),
      };
    },
    [session, router, getRequestForActivity, handleJoin],
  );

  return {
    activities,
    loading,
    submitting,
    getActionButton,
  };
};
