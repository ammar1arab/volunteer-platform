"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useNow } from "@/presentation/query";
import { useConfirmDialog, useToast } from "@/presentation/hooks";
import {
  DEFAULT_ACTIVITY_TIME_ZONE,
  getJitsiRoomName,
  getMeetingEmbedTimeoutMs,
  MEETING_LABELS,
  MEETING_PHASE_LABELS,
  MEETING_TOASTS,
  type MeetingPhase
} from "@/presentation/constants/meetingEmbed";
import {
  connectJitsiConference,
  getIdleJitsiSnapshot,
  getJitsiScriptStatus,
  getJitsiSnapshot,
  subscribeJitsiScript,
  type JitsiConferenceStatus,
  type JitsiSnapshot
} from "./jitsiClient";

export type MeetingEmbedStatus = JitsiConferenceStatus;

export const formatMeetingDate = (date?: string, timeZone = DEFAULT_ACTIVITY_TIME_ZONE) => {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("ar-JO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone
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
  timeZone = DEFAULT_ACTIVITY_TIME_ZONE
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

export const getMeetingPhaseLabel = (phase: MeetingPhase) => MEETING_PHASE_LABELS[phase];

export function useMeetingRoomEmbed(input: {
  activityId: string;
  displayName?: string;
  subject: string;
}) {
  const { showToast, toasts, removeToast } = useToast();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [retry, setRetry] = useState(0);
  const [parentNode, setParentNode] = useState<HTMLDivElement | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());

  const scriptStatus = useSyncExternalStore(
    subscribeJitsiScript,
    getJitsiScriptStatus,
    () => "idle" as const
  );

  const roomName = getJitsiRoomName(input.activityId);
  const displayName = input.displayName?.trim() || MEETING_LABELS.guestName;
  const conferenceKey =
    parentNode && scriptStatus === "ready" ? `${roomName}:${retry}:${displayName}` : "";

  const callbacks = useMemo(
    () => ({
      onJoined: () => showToast(MEETING_TOASTS.joined, "success"),
      onLeft: (reason: "hangup" | "cancel") =>
        showToast(reason === "cancel" ? MEETING_TOASTS.cancelled : MEETING_TOASTS.left, "info"),
      onFailed: () => showToast(MEETING_TOASTS.failed, "error")
    }),
    [showToast]
  );

  const subscribeConference = useCallback(
    (onStoreChange: () => void) => {
      if (!parentNode || !conferenceKey || scriptStatus !== "ready") return () => undefined;
      return connectJitsiConference(
        conferenceKey,
        {
          roomName,
          displayName,
          subject: input.subject,
          parentNode,
          callbacks
        },
        onStoreChange
      );
    },
    [parentNode, conferenceKey, scriptStatus, roomName, displayName, input.subject, callbacks]
  );

  const getConferenceSnapshot = useCallback(
    () => (conferenceKey ? getJitsiSnapshot(conferenceKey) : getIdleJitsiSnapshot()),
    [conferenceKey]
  );

  const snapshot: JitsiSnapshot = useSyncExternalStore(
    subscribeConference,
    getConferenceSnapshot,
    getIdleJitsiSnapshot
  );

  const waiting = snapshot.status === "boot" && scriptStatus !== "error";
  const now = useNow(waiting);
  const timedOut =
    waiting && now > 0 && now - startedAt >= getMeetingEmbedTimeoutMs();
  const status: MeetingEmbedStatus =
    scriptStatus === "error" || timedOut ? "failed" : snapshot.status;

  const retryLoad = useCallback(() => {
    showToast(MEETING_TOASTS.retrying, "info");
    setStartedAt(Date.now());
    setRetry((count) => count + 1);
  }, [showToast]);

  const requestLeave = useCallback(
    async (onLeave: () => void) => {
      if (status !== "joined") {
        onLeave();
        return;
      }
      const ok = await confirm({
        title: MEETING_LABELS.leaveTitle,
        message: MEETING_LABELS.leaveMessage,
        confirmText: MEETING_LABELS.leaveConfirm,
        cancelText: MEETING_LABELS.leaveCancel,
        variant: "danger",
        warning: MEETING_LABELS.leaveWarning
      });
      if (ok) onLeave();
    },
    [confirm, status]
  );

  return {
    status,
    participantCount: snapshot.participantCount,
    setParentNode,
    retryLoad,
    requestLeave,
    toasts,
    removeToast,
    confirmDialog
  };
}
