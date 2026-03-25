self.addEventListener("install", () => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("[SW] Activated");
  e.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");

  if (!event.data) {
    console.warn("[SW] Push event has no data — ignored");
    return;
  }

  let data;
  try {
    data = event.data.json();
    console.log("[SW] Push payload:", JSON.stringify(data));
  } catch (e) {
    console.error("[SW] Failed to parse push data:", e);
    data = { title: "إشعار جديد", body: event.data.text() };
  }

  const options = {
    body:     data.body     ?? "",
    icon:     "/icons/icon-192.png",
    badge:    "/icons/badge-72.png",
    dir:      "rtl",
    lang:     "ar",
    tag:      data.tag      ?? "youthprints",
    renotify: true,
    requireInteraction: true,
    data:     { url: data.url ?? "/" },
  };

  console.log("[SW] Calling showNotification with options:", JSON.stringify(options));

  event.waitUntil(
    self.registration.showNotification(data.title ?? "إشعار", options)
      .then(() => console.log("[SW] Notification shown OK"))
      .catch((err) => console.error("[SW] showNotification FAILED:", err))
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked, url:", event.notification.data?.url);
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const match = list.find((c) => "focus" in c);
        if (match) return match.focus().then((c) => c.navigate(url));
        return self.clients.openWindow(url);
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification dismissed");
});