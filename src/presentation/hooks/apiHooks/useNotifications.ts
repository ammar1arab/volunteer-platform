"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationDto } from "@/core/application/dtos";
import { notificationApi } from "@/presentation/services";

const POLL_INTERVAL = 30_000;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface NotificationsState {
  list: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  error: string;
}

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => (err instanceof Error ? err.message : fallback);

// ─────────────────────────────────────────────────────────────
// Audio Engine
//
// Strategy:
//   1. Single shared AudioContext + master GainNode (no duplicate contexts)
//   2. "Silent buffer trick" on first user gesture → unlocks iOS AudioContext
//   3. Bell synthesis: fundamental + 2nd harmonic + 3rd partial
//      → warm, resonant, WhatsApp-style two-note ascending chime
//   4. Guard: never attempt playback before unlock (_unlocked flag)
//   5. Works on: iOS Safari 14+, Android Chrome, Firefox, Desktop Safari/Chrome
// ─────────────────────────────────────────────────────────────

let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _unlocked = false;

/** Get (or lazily create) the shared AudioContext. */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    // webkitAudioContext for older iOS/Safari
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
    if (!AC) return null;

    if (!_ctx) {
      _ctx = new AC();
      // Master gain — single connection point, easier to mute globally later
      _masterGain = _ctx.createGain();
      _masterGain.gain.value = 0.75;
      _masterGain.connect(_ctx.destination);
    }

    // Resume if browser suspended it (Chrome background-tab policy)
    if (_ctx.state === "suspended") _ctx.resume();

    return _ctx;
  } catch {
    return null;
  }
}

/**
 * iOS Safari requires a real user gesture to unlock audio.
 * Playing a 1-frame silent buffer inside the gesture handler does the trick.
 */
function unlockWithSilentBuffer(ctx: AudioContext): void {
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  source.onended = () => {
    _unlocked = true;
  };
}

/**
 * Synthesise a single bell strike at `freq` Hz.
 *
 * Layers:
 *  - Fundamental (sine)       → body
 *  - 2× harmonic (sine)       → brightness / attack click
 *  - 3.5× partial (triangle)  → warmth / bell-character inharmonicity
 *
 * All layers share the master GainNode so one mute controls everything.
 */
function strike(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  at: number, // AudioContext time to start
  decay: number, // seconds until inaudible
  vol: number // peak volume (0–1)
): void {
  const layer = (type: OscillatorType, multiplier: number, peakVol: number, decayFactor: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq * multiplier;

    // Envelope: instant-ish attack, exponential decay
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peakVol, at + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay * decayFactor);

    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + decay * decayFactor + 0.05);
  };

  layer("sine", 1.0, vol, 1.0); // fundamental — body
  layer("sine", 2.0, vol * 0.35, 0.55); // octave — attack clarity
  layer("triangle", 3.5, vol * 0.12, 0.3); // bell inharmonic partial — warmth
}

/**
 * WhatsApp-style notification: two ascending bell notes.
 * C6 (1046 Hz) → E6 (1319 Hz), spaced 180 ms apart.
 *
 * First note is slightly louder (foreground), second lighter (tail).
 */
function playNotificationSound(): void {
  if (!_unlocked) return; // iOS: not yet unlocked — bail silently
  const ctx = getAudioContext();
  if (!ctx || !_masterGain) return;

  // Small lookahead (+50 ms) prevents audio glitches on mobile when JS is busy
  const t = ctx.currentTime + 0.05;

  strike(ctx, _masterGain, 1046.5, t, 1.0, 0.55); // C6
  strike(ctx, _masterGain, 1318.5, t + 0.18, 1.2, 0.42); // E6
}

/**
 * Attach unlock to every possible first-interaction event.
 * Returns a cleanup function to remove listeners if component unmounts
 * before any interaction occurs (edge case but good practice).
 */
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

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export const useNotifications = () => {
  const [state, setState] = useState<NotificationsState>({
    list: [],
    unreadCount: 0,
    loading: true,
    error: ""
  });

  const prevCountRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wire up audio unlock on mount, clean up on unmount
  useEffect(() => {
    const cleanup = bootstrapAudio();
    return cleanup;
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getUnread();
      const list: NotificationDto[] =
        (res as { data?: { notifications?: NotificationDto[] } })?.data?.notifications ?? [];
      const unreadCount: number = (res as { data?: { unreadCount?: number } })?.data?.unreadCount ?? 0;

      // Only play sound when count genuinely increases (new notification arrived)
      if (prevCountRef.current !== null && unreadCount > prevCountRef.current) {
        playNotificationSound();
      }
      prevCountRef.current = unreadCount;

      setState((p) => ({ ...p, list, unreadCount, loading: false, error: "" }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب الإشعارات")
      }));
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const res = await notificationApi.markAsRead(id);
        if (!(res as { success?: boolean })?.success) return false;
        await fetchNotifications();
        return true;
      } catch {
        return false;
      }
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (!(res as { success?: boolean })?.success) return false;
      await fetchNotifications();
      return true;
    } catch {
      return false;
    }
  }, [fetchNotifications]);

  return {
    list: state.list,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    markAsRead,
    markAllAsRead
  };
};
