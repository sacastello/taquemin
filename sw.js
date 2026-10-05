const CACHE = "taquemin-v1";
const BASE = [ "./", "./index.html", "./manifest.json", "./favicon.png" ];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname.includes("firestore") || u.hostname.includes("googleapis") ||
      u.hostname.includes("firebaseapp") || u.hostname.includes("google.com")) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.status === 200 && u.origin === location.origin) {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
