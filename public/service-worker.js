const CACHE_NAME = "fem-cache-v1";
const NOTIFICATION_TIMES = [12, 18]; // 12:00 and 18:00

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add("/")));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request).catch(() => caches.match("/")))
  );
});

// Handle periodic background sync for notifications
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "expense-reminder") {
    event.waitUntil(checkAndNotify());
  }
});

// Handle push events (for future backend push)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Family Expense";
  const options = {
    body: data.body || "Hãy vào app để điền thu chi bạn nhé! 💰",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    vibrate: [200, 100, 200],
    tag: "expense-reminder",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow("/dashboard");
    })
  );
});

// Check time and show notification
async function checkAndNotify() {
  const now = new Date();
  const hour = now.getHours();
  
  if (NOTIFICATION_TIMES.includes(hour)) {
    await self.registration.showNotification("Family Expense", {
      body: "Hãy vào app để điền thu chi bạn nhé! 💰",
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      vibrate: [200, 100, 200],
      tag: "expense-reminder",
      renotify: false,
    });
  }
}

// Message handler for manual notification trigger
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification("Family Expense", {
      body: event.data.body || "Hãy vào app để điền thu chi bạn nhé! 💰",
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      vibrate: [200, 100, 200],
      tag: "expense-reminder",
    });
  }
});
