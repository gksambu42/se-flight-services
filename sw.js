// Basic service worker for offline caching
const CACHE_NAME = 'pilot-checklist-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkResponse => {
        // Cache the new response (for same-origin GET only)
        try {
          const url = new URL(request.url);
          if (request.method === 'GET' && url.origin === location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
          }
        } catch (_) {}
        return networkResponse;
      }).catch(() => cached || Promise.reject('offline and not cached'));
      return cached || fetchPromise;
    })
  );
});
