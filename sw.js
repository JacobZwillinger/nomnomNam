// NomNom Nam — Service Worker
// Core app shell + all country data are cached on install.
// Photos and audio are cached per country by the page (see cacheCountryMedia in index.html)
// into MEDIA_CACHE, which survives app updates so travelers don't re-download.

const CORE_CACHE = "nnn-core-v13";
const MEDIA_CACHE = "nnn-media-v1";

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./data/vn.json",
  "./data/cn.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache => Promise.allSettled(CORE.map(u => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CORE_CACHE && k !== MEDIA_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const isMedia = url => /\/(images|audio)\//.test(url.pathname);

// Cache-first for same-origin requests; media goes to the long-lived media cache.
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin || event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(isMedia(url) ? MEDIA_CACHE : CORE_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});
