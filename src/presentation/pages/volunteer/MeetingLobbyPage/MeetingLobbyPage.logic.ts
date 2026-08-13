"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { UserRole } from "@/core/domain/enums";
import { ROUTES } from "@/presentation/constants";
import { useAuth, useMeetingSession } from "@/presentation/hooks";

export type MeetingLobbyView = "loading" | "notFound" | "empty" | "forbidden" | "error" | "ready";

export const useMeetingLobbyPage = () => {
  const params = useParams<{ id: string }>();
  const activityId = typeof params?.id === "string" ? params.id : "";
  const { status, role } = useAuth({ requireAuth: true });
  const { session, loading, error, errorCode, isNotFound, refresh } = useMeetingSession(activityId, {
    enabled: status === "authenticated"
  });

  const view: MeetingLobbyView = useMemo(() => {
    if (!activityId) return "notFound";
    if (status === "loading" || loading) return "loading";
    if (errorCode === "FORBIDDEN") return "forbidden";
    if (errorCode === "INVALID_STATE") return "empty";
    if (isNotFound) return "notFound";
    if (error || !session) return "error";
    return "ready";
  }, [activityId, status, loading, errorCode, isNotFound, error, session]);

  return {
    view,
    error,
    activityId,
    refresh,
    leaveHref: role === UserRole.ADMIN ? ROUTES.ADMIN.GOOGLE_MEET : ROUTES.VOLUNTEER.ACTIVITIES
  };
};
