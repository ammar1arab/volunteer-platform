"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let now = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

function emit() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function ensureTicking() {
  if (intervalId !== null || typeof window === "undefined") return;
  now = Date.now();
  intervalId = setInterval(emit, 1000);
}

function subscribe(listener: () => void) {
  ensureTicking();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function useNow(enabled = true): number {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => now || Date.now(),
    () => 0
  );
  return enabled ? snapshot : 0;
}
