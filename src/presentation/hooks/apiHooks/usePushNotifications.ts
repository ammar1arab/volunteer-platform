"use client";
import { useState, useEffect, useCallback } from "react";

// function urlBase64ToUint8Array(base64: string): Uint8Array {
//   const pad = "=".repeat((4 - (base64.length % 4)) % 4);
//   const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
//   const raw = atob(b64);
//   const output = new Uint8Array(raw.length);
//   for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
//   return output;
// }

export type PushState = "idle" | "loading" | "granted" | "denied" | "unsupported";

export const usePushNotifications = () => {
  const [state, setState] = useState<PushState>("idle");

  const isIOS = typeof window !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const isStandalone = typeof window !== "undefined" && (window.navigator as any).standalone === true;

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  useEffect(() => {
    if (!isSupported) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setState("granted");
    else if (Notification.permission === "denied") setState("denied");
  }, [isSupported]);

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
      const sub: PushSubscription | null = (await reg?.pushManager.getSubscription()) ?? null;
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
