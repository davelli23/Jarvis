// JARVIS Service Worker: App-Hülle offline verfügbar, Daten immer frisch aus dem Netz.
const CACHE = "jarvis-v6";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // APIs nicht cachen
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
// Vorbereitet für echte Push-Nachrichten vom späteren Server (Web Push)
self.addEventListener("push", e => {
  const d = e.data ? e.data.json() : { title: "JARVIS", body: "Neue Meldung." };
  e.waitUntil(self.registration.showNotification(d.title || "JARVIS", { body: d.body, icon: "icon-192.png", badge: "icon-192.png", tag: d.tag }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow("./index.html")));
});
