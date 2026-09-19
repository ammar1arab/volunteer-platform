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
