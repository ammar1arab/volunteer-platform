"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { UserRole } from "@/core/domain/enums";
import { ROUTES } from "@/presentation/constants";
import { useAuth, useMeetingLaunch } from "@/presentation/hooks";

export type MeetingLobbyView = "loading" | "notFound" | "empty" | "forbidden" | "error" | "ready";

export const useMeetingLobbyPage = () => {
  const params = useParams<{ id: string }>();
  const activityId = typeof params?.id === "string" ? params.id : "";
  const { status, user, role } = useAuth({ requireAuth: true });
  const { launch, loading, error, errorCode, isNotFound, refresh } = useMeetingLaunch(activityId);

  const view: MeetingLobbyView = useMemo(() => {
    if (!activityId) return "notFound";
    if (status === "loading" || loading) return "loading";
    if (errorCode === "FORBIDDEN") return "forbidden";
    if (errorCode === "INVALID_STATE" || (launch && !launch.url)) return "empty";
    if (isNotFound) return "notFound";
    if (error || !launch?.url) return "error";
    return "ready";
  }, [activityId, status, loading, errorCode, isNotFound, error, launch]);

  return {
    view,
    launch,
    error,
    activityId,
    displayName: user?.name ?? "",
    refresh,
    leaveHref: role === UserRole.ADMIN ? ROUTES.ADMIN.GOOGLE_MEET : ROUTES.VOLUNTEER.ACTIVITIES
  };
};
