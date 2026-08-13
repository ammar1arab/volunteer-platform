"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth, useMeetingLaunch } from "@/presentation/hooks";

export type MeetingLobbyView = "loading" | "notFound" | "empty" | "error" | "ready";

export const useMeetingLobbyPage = () => {
  const params = useParams<{ id: string }>();
  const activityId = params?.id ?? "";
  const { status, user } = useAuth({ requireAuth: true });
  const { launch, loading, error, errorCode, isNotFound } = useMeetingLaunch(activityId);

  const view: MeetingLobbyView = useMemo(() => {
    if (status === "loading" || loading) return "loading";
    if (errorCode === "INVALID_STATE" || (launch && !launch.url)) return "empty";
    if (isNotFound) return "notFound";
    if (error || !launch?.url) return "error";
    return "ready";
  }, [status, loading, errorCode, isNotFound, error, launch]);

  return {
    view,
    launch,
    error,
    activityId,
    displayName: user?.name ?? ""
  };
};
