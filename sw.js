// LES ENTRETIENS — service worker : network-first, repli cache (lisible hors ligne, dans le train)
const CACHE = "entretiens-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" }).then(res => {
      // on ne garde que les bonnes réponses : pendant une mise en ligne, GitHub Pages
      // répond 404 quelques secondes, et une page d'erreur en cache serait pire que tout
      if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
