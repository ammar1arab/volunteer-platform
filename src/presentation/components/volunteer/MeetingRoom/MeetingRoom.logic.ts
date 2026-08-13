"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { API_ENDPOINTS } from "@/lib/config";
import { useNow } from "@/presentation/query";
import { useConfirmDialog, useMeetingSession, useToast } from "@/presentation/hooks";
import { meetingsApi } from "@/presentation/services/meetings.service";
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

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type FullscreenNode = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const pendingLeaves = new Map<string, ReturnType<typeof setTimeout>>();

const noopSubscribe = () => () => undefined;

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

const cancelPendingLeave = (activityId: string) => {
  const timer = pendingLeaves.get(activityId);
  if (!timer) return;
  clearTimeout(timer);
  pendingLeaves.delete(activityId);
};

const sendLeave = (activityId: string) => {
  const url = API_ENDPOINTS.MEETINGS.SESSION(activityId);
  const body = JSON.stringify({ action: "leave" });
  const blob = new Blob([body], { type: "application/json" });
  const sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, blob);
  if (sent) return;
  void fetch(url, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    credentials: "same-origin"
  });
};

const scheduleLeave = (activityId: string) => {
  cancelPendingLeave(activityId);
  pendingLeaves.set(
    activityId,
    setTimeout(() => {
      pendingLeaves.delete(activityId);
      sendLeave(activityId);
    }, 500)
  );
};

export function useMeetingPresence(activityId: string, enabled: boolean) {
  const subscribe = useCallback(
    (_onStoreChange: () => void) => {
      if (!enabled || !activityId) return () => undefined;
      cancelPendingLeave(activityId);
      const onPageHide = () => {
        cancelPendingLeave(activityId);
        sendLeave(activityId);
      };
      window.addEventListener("pagehide", onPageHide);
      return () => {
        window.removeEventListener("pagehide", onPageHide);
        scheduleLeave(activityId);
      };
    },
    [activityId, enabled]
  );

  useSyncExternalStore(subscribe, () => true, () => true);
}

const subscribeFullscreen = (onStoreChange: () => void) => {
  document.addEventListener("fullscreenchange", onStoreChange);
  document.addEventListener("webkitfullscreenchange", onStoreChange);
  return () => {
    document.removeEventListener("fullscreenchange", onStoreChange);
    document.removeEventListener("webkitfullscreenchange", onStoreChange);
  };
};

const getIsFullscreen = () => {
  if (typeof document === "undefined") return false;
  const doc = document as FullscreenDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
};

const requestFullscreen = (node: HTMLElement) => {
  const target = node as FullscreenNode;
  const request = target.requestFullscreen ?? target.webkitRequestFullscreen;
  if (!request) return;
  void request.call(target);
};

const exitFullscreen = () => {
  const doc = document as FullscreenDocument;
  const exit = doc.exitFullscreen ?? doc.webkitExitFullscreen;
  if (!exit) return;
  void exit.call(doc);
};

export function useMeetingFullscreen() {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const active = useSyncExternalStore(subscribeFullscreen, getIsFullscreen, () => false);

  const toggle = useCallback(() => {
    if (getIsFullscreen()) {
      exitFullscreen();
      return;
    }
    if (node) requestFullscreen(node);
  }, [node]);

  return { setNode, active, toggle };
}

export function useMeetingRoomEmbed(input: {
  activityId: string;
  displayName?: string;
  email?: string;
  subject: string;
  enabled: boolean;
}) {
  const { showToast, toasts, removeToast } = useToast();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [retry, setRetry] = useState(0);
  const [parentNode, setParentNode] = useState<HTMLDivElement | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [mediaArmed, setMediaArmed] = useState(input.enabled);
  if (mediaArmed !== input.enabled) {
    setMediaArmed(input.enabled);
    if (input.enabled) setStartedAt(Date.now());
  }

  const subscribeScript = input.enabled ? subscribeJitsiScript : noopSubscribe;
  const scriptStatus = useSyncExternalStore(
    subscribeScript,
    input.enabled ? getJitsiScriptStatus : () => "idle" as const,
    () => "idle" as const
  );

  const roomName = getJitsiRoomName(input.activityId);
  const displayName = input.displayName?.trim() || MEETING_LABELS.guestName;
  const email = input.email?.trim() || "";
  const conferenceKey =
    input.enabled && parentNode && scriptStatus === "ready"
      ? `${roomName}:${retry}:${displayName}:${email}`
      : "";

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
          email: email || undefined,
          subject: input.subject,
          parentNode,
          callbacks
        },
        onStoreChange
      );
    },
    [parentNode, conferenceKey, scriptStatus, roomName, displayName, email, input.subject, callbacks]
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

  const waiting = input.enabled && snapshot.status === "boot" && scriptStatus !== "error";
  const now = useNow(waiting);
  const timedOut = waiting && now > 0 && now - startedAt >= getMeetingEmbedTimeoutMs();
  const status: MeetingEmbedStatus =
    scriptStatus === "error" || timedOut ? "failed" : snapshot.status;

  const retryLoad = useCallback(() => {
    showToast(MEETING_TOASTS.retrying, "info");
    setStartedAt(Date.now());
    setRetry((count) => count + 1);
  }, [showToast]);

  const requestLeave = useCallback(
    async (onLeave: () => void) => {
      if (status === "joined") {
        const ok = await confirm({
          title: MEETING_LABELS.leaveTitle,
          message: MEETING_LABELS.leaveMessage,
          confirmText: MEETING_LABELS.leaveConfirm,
          cancelText: MEETING_LABELS.leaveCancel,
          variant: "danger",
          warning: MEETING_LABELS.leaveWarning
        });
        if (!ok) return;
      }
      cancelPendingLeave(input.activityId);
      void meetingsApi.leaveSession(input.activityId);
      onLeave();
    },
    [confirm, status, input.activityId]
  );

  return {
    status,
    participantCount: snapshot.participantCount,
    setParentNode,
    retryLoad,
    requestLeave,
    showToast,
    toasts,
    removeToast,
    confirmDialog
  };
}

export function useMeetingRoom(activityId: string) {
  const gate = useMeetingSession(activityId);
  const identityName = gate.session?.identity.fullName || MEETING_LABELS.guestName;
  const identityEmail = gate.session?.identity.email || "";
  const canEnterMedia = gate.session?.stage === "admitted" && Boolean(gate.session.identity.email);

  useMeetingPresence(activityId, Boolean(gate.session));

  const embed = useMeetingRoomEmbed({
    activityId,
    displayName: identityName,
    email: identityEmail,
    subject: gate.session?.title?.trim() || MEETING_LABELS.roomTitle,
    enabled: canEnterMedia
  });

  const fullscreen = useMeetingFullscreen();

  return {
    ...embed,
    session: gate.session,
    sessionLoading: gate.loading,
    sessionError: gate.error,
    identityName,
    identityEmail,
    canEnterMedia,
    admit: gate.admit,
    admitting: gate.admitting,
    refreshSession: gate.refresh,
    fullscreen
  };
}
