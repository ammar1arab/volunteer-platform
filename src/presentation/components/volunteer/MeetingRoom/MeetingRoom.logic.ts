"use client";

import { useCallback, useState } from "react";
import { useNow } from "@/presentation/query";

export const MEETING_EMBED_TIMEOUT_MS = 12_000;

export type MeetingEmbedStatus = "loading" | "ready" | "failed";
export type MeetingPhase = "upcoming" | "live" | "ended";

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

const parseClock = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return { hours, minutes };
};

const pad = (value: number) => String(value).padStart(2, "0");

const wallClockToMs = (dateIso: string, hhmm: string, timeZone: string) => {
  const clock = parseClock(hhmm);
  if (!clock) return null;
  const ymd = new Date(dateIso).toISOString().slice(0, 10);
  const asUtc = Date.parse(`${ymd}T${pad(clock.hours)}:${pad(clock.minutes)}:00.000Z`);
  if (Number.isNaN(asUtc)) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date(asUtc));
    const read = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value);
    const hour = read("hour") % 24;
    const localAsUtc = Date.UTC(read("year"), read("month") - 1, read("day"), hour, read("minute"), 0);
    return asUtc - (localAsUtc - asUtc);
  } catch {
    return asUtc;
  }
};

export const getMeetingPhase = (
  date?: string,
  startTime?: string,
  endTime?: string,
  now = Date.now(),
  timeZone = "Asia/Amman"
): MeetingPhase | null => {
  if (!date || !startTime || !endTime) return null;
  const start = wallClockToMs(date, startTime, timeZone);
  const end = wallClockToMs(date, endTime, timeZone);
  if (start == null || end == null) return null;
  const graceMs = 15 * 60 * 1000;

  if (now < start - graceMs) return "upcoming";
  if (now > end + graceMs) return "ended";
  return "live";
};

export const getMeetingPhaseLabel = (phase: MeetingPhase) => {
  if (phase === "live") return "مباشر";
  if (phase === "upcoming") return "قادم";
  return "منتهٍ";
};

export const getInAppMeetingSrc = (activityId: string, displayName?: string, retry = 0) => {
  const room = `YouthPrints${activityId.replace(/-/g, "")}`;
  const name = displayName?.trim() || "متطوع";
  const hash = [
    "config.prejoinConfig.enabled=true",
    "config.prejoinPageEnabled=true",
    "config.disableDeepLinking=true",
    "config.startWithAudioMuted=true",
    "config.startWithVideoMuted=true",
    'config.defaultLanguage="ar"',
    "config.disableInviteFunctions=true",
    "interfaceConfig.SHOW_JITSI_WATERMARK=false",
    "interfaceConfig.SHOW_BRAND_WATERMARK=false",
    "interfaceConfig.MOBILE_APP_PROMO=false",
    "interfaceConfig.SHOW_CHROME_EXTENSION_BANNER=false",
    `userInfo.displayName=${JSON.stringify(name)}`,
    retry > 0 ? `retry=${retry}` : ""
  ]
    .filter(Boolean)
    .join("&");

  return `https://meet.jit.si/${encodeURIComponent(room)}#${hash}`;
};

export function useMeetingRoomEmbed(activityId: string, displayName?: string) {
  const [retry, setRetry] = useState(0);
  const src = getInAppMeetingSrc(activityId, displayName, retry);
  const [session, setSession] = useState({ src, startedAt: Date.now(), loaded: false });

  if (session.src !== src) {
    setSession({ src, startedAt: Date.now(), loaded: false });
  }

  const waiting = !session.loaded;
  const now = useNow(waiting);
  const timedOut = waiting && now > 0 && now - session.startedAt >= MEETING_EMBED_TIMEOUT_MS;
  const status: MeetingEmbedStatus = session.loaded ? "ready" : timedOut ? "failed" : "loading";

  const handleLoad = useCallback(() => {
    setSession((current) => (current.src === src ? { ...current, loaded: true } : current));
  }, [src]);

  const retryLoad = useCallback(() => {
    setRetry((count) => count + 1);
  }, []);

  return { src, status, handleLoad, retryLoad };
}
