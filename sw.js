const CACHE_NAME = 'road-to-85-v6';
const CORE_ASSETS = [
  './',
  './index.html',
  './Road_to_85.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(CORE_ASSETS.map(u => fetch(u, {cache: 'no-store'}).then(r => r.ok ? cache.put(u, r) : null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Bypass iOS WebKit HTTP cache when online; serve normalized cached asset when offline on the golf course
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const cleanUrl = new URL(event.request.url);
  cleanUrl.search = '';
  cleanUrl.hash = '';
  const cacheKey = cleanUrl.toString();

  event.respondWith(
    fetch(event.request, {cache: 'no-store'})
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(cacheKey, copy));
        }
        return res;
      })
      .catch(() => caches.match(cacheKey).then(r => r || caches.match(event.request, {ignoreSearch: true})))
  );
});
