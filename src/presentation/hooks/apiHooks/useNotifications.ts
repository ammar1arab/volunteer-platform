"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { NotificationDto, NotificationsDto } from "@/core/application/dtos";
import { notificationApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useApiMutation,
  useCacheUpdater,
  useFetchData
} from "@/presentation/query";

const POLL_INTERVAL = 10_000;
const NOTIFICATIONS_KEY = queryKeys.notifications.recent();

let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _unlocked = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext!;
    if (!AC) return null;
    if (!_ctx) {
      _ctx = new AC();
      _masterGain = _ctx.createGain();
      _masterGain.gain.value = 0.75;
      _masterGain.connect(_ctx.destination);
    }
    if (_ctx.state === "suspended") void _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function unlockWithSilentBuffer(ctx: AudioContext): void {
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  _unlocked = true;
}

function strike(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  at: number,
  decay: number,
  vol: number
): void {
  const layer = (type: OscillatorType, multiplier: number, peakVol: number, decayFactor: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * multiplier;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peakVol, at + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay * decayFactor);
    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + decay * decayFactor + 0.05);
  };
  layer("sine", 1.0, vol, 1.0);
  layer("sine", 2.0, vol * 0.35, 0.55);
  layer("triangle", 3.5, vol * 0.12, 0.3);
}

function playNotificationSound(): void {
  if (!_unlocked) return;
  const ctx = getAudioContext();
  if (!ctx || !_masterGain) return;
  const t = ctx.currentTime + 0.05;
  strike(ctx, _masterGain, 1046.5, t, 1.0, 0.55);
  strike(ctx, _masterGain, 1318.5, t + 0.18, 1.2, 0.42);
}

function bootstrapAudio(): () => void {
  if (typeof window === "undefined") return () => {};
  const EVENTS = ["touchstart", "touchend", "pointerdown", "mousedown", "keydown", "click"] as const;
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && !_unlocked) unlockWithSilentBuffer(ctx);
    EVENTS.forEach((e) => document.removeEventListener(e, unlock, true));
  };
  EVENTS.forEach((e) => document.addEventListener(e, unlock, { once: true, capture: true }));
  return () => EVENTS.forEach((e) => document.removeEventListener(e, unlock, true));
}

export const useNotifications = () => {
  const pendingReads = useRef<Set<string>>(new Set());
  const prevCountRef = useRef<number | null>(null);
  const { updateData } = useCacheUpdater<NotificationsDto>(NOTIFICATIONS_KEY);

  useEffect(() => bootstrapAudio(), []);

  const query = useFetchData<NotificationsDto>({
    queryKey: NOTIFICATIONS_KEY,
    request: async () => {
      const data = unwrapResult(await notificationApi.getRecent());
      const list = data.notifications.map((n) => {
        if (pendingReads.current.has(n.id)) {
          if (n.isRead) pendingReads.current.delete(n.id);
          return { ...n, isRead: true };
        }
        return n;
      });
      return { notifications: list, unreadCount: data.unreadCount };
    },
    options: {
      staleTime: 5_000,
      refetchInterval: POLL_INTERVAL,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true
    }
  });


  const unreadCount = query.data?.unreadCount ?? 0;
  useEffect(() => {
    if (prevCountRef.current !== null && unreadCount > prevCountRef.current) {
      playNotificationSound();
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  const markReadMutation = useApiMutation<{ success: boolean }, string>({
    request: async (id) => unwrapResult(await notificationApi.markAsRead(id))
  });

  const markAllMutation = useApiMutation<{ success: boolean }, void>({
    request: async () => unwrapResult(await notificationApi.markAllAsRead())
  });

  const clearMutation = useApiMutation<{ success: boolean }, void>({
    request: async () => unwrapResult(await notificationApi.clearHistory()),
    invalidateQueries: NOTIFICATIONS_KEY
  });

  const refetch = query.refetch;
  const markReadAsync = markReadMutation.mutateAsync;
  const markAllAsync = markAllMutation.mutateAsync;
  const clearAsync = clearMutation.mutateAsync;

  const markAsRead = useCallback(
    async (id: string) => {
      pendingReads.current.add(id);
      updateData((prev) => {
        if (!prev) return { notifications: [], unreadCount: 0 };
        const wasUnread = prev.notifications.find((n) => n.id === id)?.isRead === false;
        return {
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
      try {
        await markReadAsync(id);
        pendingReads.current.delete(id);
        return true;
      } catch {
        pendingReads.current.delete(id);
        await refetch();
        return false;
      }
    },
    [markReadAsync, refetch, updateData]
  );

  const markAllAsRead = useCallback(async () => {
    updateData((prev) => {
      if (!prev) return { notifications: [], unreadCount: 0 };
      return {
        notifications: prev.notifications.map((n) => {
          pendingReads.current.add(n.id);
          return { ...n, isRead: true };
        }),
        unreadCount: 0
      };
    });
    try {
      await markAllAsync();
      pendingReads.current.clear();
      return true;
    } catch {
      pendingReads.current.clear();
      await refetch();
      return false;
    }
  }, [markAllAsync, refetch, updateData]);

  const clearHistory = useCallback(async () => {
    pendingReads.current.clear();
    updateData({ notifications: [], unreadCount: 0 });
    try {
      await clearAsync();
      return true;
    } catch {
      await refetch();
      return false;
    }
  }, [clearAsync, refetch, updateData]);

  const list = (query.data?.notifications ?? EMPTY_ARRAY) as NotificationDto[];
  const error = query.error ? getErrorMessage(query.error, "فشل في جلب الإشعارات") : "";

  return useMemo(
    () => ({
      list,
      unreadCount,
      loading: query.isLoading,
      error,
      markAsRead,
      markAllAsRead,
      clearHistory
    }),
    [list, unreadCount, query.isLoading, error, markAsRead, markAllAsRead, clearHistory]
  );
};
