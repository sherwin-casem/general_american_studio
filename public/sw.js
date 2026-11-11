/* Offline support for General American Studio.
   Pages and the recordings list: network first, falling back to the cache.
   Built assets (content-hashed) and fonts: cache first.
   Word recordings: cached the first time they play, in a cache that survives app updates.
   Bump VERSION to drop old app caches after a release; bump AUDIO only when recordings change. */
const VERSION = 'gas-v3.2.0';
const AUDIO = 'gas-audio-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION && k !== AUDIO).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Stores a full, successful same-origin response. Partial (206) responses can't be cached. */
function cacheCopy(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  const copy = response.clone();
  caches
    .open(cacheName)
    .then((cache) => cache.put(request, copy))
    .catch(() => {
      /* storage full or unavailable: serving still works without the cache */
    });
}

function networkFirst(request, fallbackKey) {
  return fetch(request)
    .then((response) => {
      cacheCopy(VERSION, fallbackKey, response);
      return response;
    })
    .catch(() => caches.match(fallbackKey).then((cached) => cached || Response.error()));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          cacheCopy(VERSION, './index.html', response);
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./'))),
    );
    return;
  }

  if (url.pathname.endsWith('/audio/manifest.json')) {
    event.respondWith(networkFirst(request, url.pathname));
    return;
  }

  if (url.pathname.includes('/audio/words/')) {
    // Audio elements may ask for a byte range; fetch and keep the whole file instead.
    const key = url.pathname;
    event.respondWith(
      caches.open(AUDIO).then((cache) =>
        cache.match(key).then(
          (cached) =>
            cached ||
            fetch(url.href).then((response) => {
              cacheCopy(AUDIO, key, response);
              return response;
            }),
        ),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          cacheCopy(VERSION, request, response);
          return response;
        }),
    ),
  );
});
