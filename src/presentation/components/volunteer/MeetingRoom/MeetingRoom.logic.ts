"use client";

import { useCallback, useState } from "react";
import { useNow } from "@/presentation/query";

export type MeetingRoomEmbedStatus = "loading" | "ready";

const EMBED_READY_MS = 4000;

export const formatMeetingDate = (date?: string) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("ar-JO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return date;
  }
};

export const useMeetingRoomEmbed = (url: string) => {
  const [session, setSession] = useState({ url, startedAt: Date.now(), loaded: false });

  if (session.url !== url) {
    setSession({ url, startedAt: Date.now(), loaded: false });
  }

  const now = useNow(!session.loaded);
  const status: MeetingRoomEmbedStatus =
    session.loaded || now - session.startedAt >= EMBED_READY_MS ? "ready" : "loading";

  const handleLoad = useCallback(() => {
    setSession((current) => (current.url === url ? { ...current, loaded: true } : current));
  }, [url]);

  return { status, handleLoad };
};
