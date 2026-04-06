const CACHE_NAME = "fem-static-v3";

// Chỉ cache static assets (không cache HTML navigation)
const STATIC_ASSETS = [
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore cache errors on install
      })
    )
  );
});

self.addEventListener("activate", (event) => {
  // Xoá cache cũ
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ⚠️ QUAN TRỌNG: Không intercept navigation requests (HTML pages)
  // Next.js SSR + NextAuth cần đi thẳng tới server để xử lý session/redirect
  if (request.mode === "navigate") {
    return; // Để browser tự xử lý
  }

  // Không cache API calls
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Không cache non-GET
  if (request.method !== "GET") {
    return;
  }

  // Chỉ cache static files (ảnh, icon, manifest)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith(".woff2");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
  // Các request khác → đi thẳng network, không cache
});

// Handle push notification từ server
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Chi tiêu gia đình";
  const options = {
    body: data.body || "Đã đến giờ ghi chi tiêu! 📝",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: "expense-reminder",
    renotify: true,
    data: { url: data.url || "/dashboard" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Khi user bấm vào thông báo
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});

// Message từ client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification("Chi tiêu gia đình", {
      body: event.data.body || "Đã đến giờ ghi chi tiêu! 📝",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "expense-reminder",
      data: { url: "/dashboard" },
    });
  }

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
