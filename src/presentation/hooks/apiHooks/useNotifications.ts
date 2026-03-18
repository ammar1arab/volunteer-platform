"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationDto } from "@/core/application/dtos";
import { notificationApi } from "@/presentation/services";

const POLL_INTERVAL = 10_000;

interface NotificationsState {
  list: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  error: string;
}

let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _unlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
    if (!AC) return null;
    if (!_ctx) {
      _ctx = new AC();
      _masterGain = _ctx.createGain();
      _masterGain.gain.value = 0.75;
      _masterGain.connect(_ctx.destination);
    }
    if (_ctx.state === "suspended") _ctx.resume();
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

function strike(ctx: AudioContext, master: GainNode, freq: number, at: number, decay: number, vol: number): void {
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
  const [state, setState] = useState<NotificationsState>({
    list: [],
    unreadCount: 0,
    loading: true,
    error: ""
  });

  const prevCountRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingReads = useRef<Set<string>>(new Set());

  useEffect(() => bootstrapAudio(), []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getRecent();
      const rawList = (res as { data?: { notifications?: NotificationDto[] } })?.data?.notifications ?? [];
      const unreadCount = (res as { data?: { unreadCount?: number } })?.data?.unreadCount ?? 0;

      const list = rawList.map((n) => {
        if (pendingReads.current.has(n.id)) {
          if (n.isRead) pendingReads.current.delete(n.id);
          return { ...n, isRead: true };
        }
        return n;
      });

      if (prevCountRef.current !== null && unreadCount > prevCountRef.current) {
        playNotificationSound();
      }
      prevCountRef.current = unreadCount;
      setState({ list, unreadCount, loading: false, error: "" });
    } catch {
      setState((p) => ({ ...p, loading: false, error: "فشل في جلب الإشعارات" }));
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);

    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    const onFocus = () => fetchNotifications();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      pendingReads.current.add(id);
      setState((p) => {
        const wasUnread = p.list.find((n) => n.id === id)?.isRead === false;
        return {
          ...p,
          list: p.list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unreadCount: wasUnread ? Math.max(0, p.unreadCount - 1) : p.unreadCount
        };
      });
      try {
        await notificationApi.markAsRead(id);
        pendingReads.current.delete(id);
        return true;
      } catch {
        pendingReads.current.delete(id);
        fetchNotifications();
        return false;
      }
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    setState((p) => ({
      ...p,
      list: p.list.map((n) => {
        pendingReads.current.add(n.id);
        return { ...n, isRead: true };
      }),
      unreadCount: 0
    }));
    try {
      await notificationApi.markAllAsRead();
      pendingReads.current.clear();
      return true;
    } catch {
      pendingReads.current.clear();
      fetchNotifications();
      return false;
    }
  }, [fetchNotifications]);

  const clearHistory = useCallback(async () => {
    pendingReads.current.clear();
    setState((p) => ({ ...p, list: [], unreadCount: 0 }));
    try {
      await notificationApi.clearHistory();
      return true;
    } catch {
      fetchNotifications();
      return false;
    }
  }, [fetchNotifications]);

  return {
    list: state.list,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    markAsRead,
    markAllAsRead,
    clearHistory
  };
};
