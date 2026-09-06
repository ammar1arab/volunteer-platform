export function pingOnce(storageKey: string, url: string) {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    // private mode / blocked storage — still send once per call
  }

  void fetch(url, { method: "POST", keepalive: true });
}
