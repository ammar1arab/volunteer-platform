self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: "إشعار جديد", body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:      data.body,
      icon:      "/icons/icon-192.png",
      badge:     "/icons/badge-72.png",
      dir:       "rtl",
      lang:      "ar",
      tag:       data.tag ?? "youthprints",
      renotify:  true,
      data:      { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
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