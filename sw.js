// NomNom Nam — Service Worker
// Caches all assets for offline use (critical for travel!)

const CACHE = "nomnomnam-v8";

const STATIC = [
  "./index.html",
  "./manifest.json"
];

// All dish audio files
const AUDIO = [
  "./audio/pho-bo.mp3",
  "./audio/banh-mi.mp3",
  "./audio/bun-bo-hue.mp3",
  "./audio/cao-lau.mp3",
  "./audio/mi-quang.mp3",
  "./audio/banh-xeo.mp3",
  "./audio/goi-cuon.mp3",
  "./audio/cha-gio.mp3",
  "./audio/bun-cha.mp3",
  "./audio/com-tam.mp3",
  "./audio/banh-cuon.mp3",
  "./audio/hu-tieu.mp3",
  "./audio/bun-rieu.mp3",
  "./audio/canh-chua.mp3",
  "./audio/banh-khot.mp3",
  "./audio/banh-beo.mp3",
  "./audio/che.mp3",
  "./audio/bo-luc-lac.mp3",
  "./audio/oc.mp3",
  "./audio/chao-ga.mp3",
  "./audio/pho-ga.mp3",
  "./audio/bun-thit-nuong.mp3",
  "./audio/bun-mam.mp3",
  "./audio/banh-canh-cua.mp3",
  "./audio/bot-chien.mp3",
  "./audio/bo-la-lot.mp3",
  "./audio/bun-moc.mp3",
  "./audio/com-hen.mp3",
  "./audio/bun-hen.mp3",
  "./audio/nem-lui.mp3",
  "./audio/banh-trang-nuong.mp3",
  "./audio/banh-ep.mp3",
  "./audio/banh-khoai.mp3",
  "./audio/banh-trang-trung.mp3",
  "./audio/banh-da-xuc-hen.mp3",
  "./audio/banh-tam-bi.mp3",
  "./audio/com-suon.mp3",
  "./audio/canh-kho-qua-nhoi-thit.mp3",
  "./audio/che-chuoi.mp3",
  "./audio/cuon-diep.mp3",
  "./audio/banh-canh.mp3",
  "./audio/canh-cua.mp3",
  "./audio/nem-ran.mp3",
  "./audio/banh-trang-cuon.mp3",
  "./audio/banh-chung.mp3",
  "./audio/banh-gio.mp3",
  "./audio/hu-tieu-nam-vang.mp3",
  "./audio/hu-tieu-my-tho.mp3",
  "./audio/banh-da-cua.mp3",
  "./audio/banh-hoi.mp3",
  "./audio/bun-dau-mam-tom.mp3",
  "./audio/bun-oc.mp3",
  "./audio/bun-thang.mp3",
  "./audio/banh-bot-loc.mp3",
  "./audio/banh-uot.mp3"
];

// All dish images
const IMAGES = [
  "./images/pho-bo.jpg",
  "./images/banh-mi.jpg",
  "./images/bun-bo-hue.jpg",
  "./images/cao-lau.jpg",
  "./images/mi-quang.jpg",
  "./images/banh-xeo.jpg",
  "./images/goi-cuon.jpg",
  "./images/cha-gio.jpg",
  "./images/bun-cha.jpg",
  "./images/com-tam.jpg",
  "./images/banh-cuon.jpg",
  "./images/hu-tieu.jpg",
  "./images/bun-rieu.jpg",
  "./images/canh-chua.jpg",
  "./images/banh-khot.jpg",
  "./images/banh-beo.jpg",
  "./images/che.jpg",
  "./images/bo-luc-lac.jpg",
  "./images/oc.jpg",
  "./images/chao-ga.jpg",
  "./images/pho-ga.jpg",
  "./images/bun-thit-nuong.jpg",
  "./images/bun-mam.jpg",
  "./images/banh-canh-cua.jpg",
  "./images/bot-chien.jpg",
  "./images/bo-la-lot.jpg",
  "./images/bun-moc.jpg",
  "./images/com-hen.jpg",
  "./images/bun-hen.jpg",
  "./images/nem-lui.jpg",
  "./images/banh-trang-nuong.jpg",
  "./images/banh-ep.jpg",
  "./images/banh-khoai.jpg",
  "./images/banh-trang-trung.jpg",
  "./images/banh-da-xuc-hen.jpg",
  "./images/banh-tam-bi.jpg",
  "./images/com-suon.jpg",
  "./images/canh-kho-qua-nhoi-thit.jpg",
  "./images/che-chuoi.jpg",
  "./images/cuon-diep.jpg",
  "./images/banh-canh.jpg",
  "./images/canh-cua.jpg",
  "./images/nem-ran.jpg",
  "./images/banh-trang-cuon.jpg",
  "./images/banh-chung.jpg",
  "./images/banh-gio.jpg",
  "./images/hu-tieu-nam-vang.jpg",
  "./images/hu-tieu-my-tho.jpg",
  "./images/banh-da-cua.jpg",
  "./images/banh-hoi.jpg",
  "./images/bun-dau-mam-tom.jpg",
  "./images/bun-oc.jpg",
  "./images/bun-thang.jpg",
  "./images/banh-bot-loc.jpg",
  "./images/banh-uot.jpg"
];

const ALL_ASSETS = [...STATIC, ...AUDIO, ...IMAGES];

// ── Install: cache everything
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log("[SW] Caching all assets");
      // Cache in chunks to avoid timeout on large sets
      const chunks = [];
      for (let i = 0; i < ALL_ASSETS.length; i += 5) {
        chunks.push(ALL_ASSETS.slice(i, i + 5));
      }
      return chunks.reduce((promise, chunk) =>
        promise.then(() =>
          Promise.allSettled(chunk.map(url =>
            cache.add(url).catch(e => console.warn("[SW] Failed to cache:", url, e))
          ))
        ),
        Promise.resolve()
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for local assets, network-first for anything else
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
