/* Service worker Tryout SIMAK UI — cache app-shell agar bisa dibuka offline.
   Naikkan CACHE_VERSION tiap kali aset inti berubah agar klien mengambil versi baru. */
const CACHE_VERSION = "tryout-simak-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // biarkan lintas-domain apa adanya
  if (url.pathname.startsWith("/api/")) return;     // API selalu ke jaringan (auth/sync)

  // Navigasi halaman: jaringan dulu, fallback ke index.html dari cache saat offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Aset statis: sajikan dari cache, perbarui di latar belakang (stale-while-revalidate).
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Pengingat review (best-effort, hanya pada PWA terpasang di browser yang mendukung).
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "review-reminder") {
    event.waitUntil(
      self.registration.showNotification("Waktunya review 📅", {
        body: "Buka Tryout Superr untuk mengulang soal yang jatuh tempo hari ini.",
        icon: "./icon.svg",
        badge: "./icon.svg",
        tag: "review-reminder",
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
