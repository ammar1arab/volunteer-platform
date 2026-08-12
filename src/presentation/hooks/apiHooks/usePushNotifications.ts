"use client";

import { useCallback, useState } from "react";

export type PushState = "idle" | "loading" | "granted" | "denied" | "unsupported";

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

function getInitialPushState(): PushState {
  if (typeof window === "undefined") return "idle";
  const supported =
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!supported) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "idle";
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushState>(getInitialPushState);

  const isIOS = typeof window !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    typeof window !== "undefined" && (window.navigator as NavigatorStandalone).standalone === true;

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setState("loading");

    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return false;
      }

      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      });

      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: json.keys })
      });

      if (!res.ok) {
        setState("idle");
        return false;
      }

      setState("granted");
      return true;
    } catch {
      setState("idle");
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = (await reg?.pushManager.getSubscription()) ?? null;
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint })
        });
        await sub.unsubscribe();
      }
    } finally {
      setState("idle");
    }
  }, []);

  return { state, subscribe, unsubscribe, isIOS, isStandalone, isSupported };
};
