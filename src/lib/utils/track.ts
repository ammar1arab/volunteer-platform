import { ammanDayKey } from "./date";

const pendingVisitors = new Set<string>();
let fallbackVisitorId: string | undefined;

export async function trackVisitor(url: string, identity: string) {
  const marker = `${ammanDayKey(new Date())}:${identity}`;
  if (pendingVisitors.has(marker)) return;
  pendingVisitors.add(marker);
  try {
    let visitorId = fallbackVisitorId ??= crypto.randomUUID();
    try {
      if (localStorage.getItem("basmat-visitor-observation") === marker) return;
      visitorId = localStorage.getItem("basmat-visitor-id") ?? visitorId;
      localStorage.setItem("basmat-visitor-id", visitorId);
    } catch {}
    const response = await fetch(url, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, referrer: document.referrer.slice(0, 800) })
    });
    if (!response.ok) return;
    const result: { success: boolean; data?: { recorded: boolean } } = await response.json();
    if (result.success && result.data?.recorded) {
      try { localStorage.setItem("basmat-visitor-observation", marker); } catch {}
    }
  } catch {
    return;
  } finally {
    pendingVisitors.delete(marker);
  }
}

export function pingOnce(storageKey: string, url: string, body?: Record<string, string>) {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // private mode / blocked storage — still send once per call
  }

  void fetch(url, {
    method: "POST",
    keepalive: true,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
}
