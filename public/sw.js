const CACHE_NAME = 'splitwise-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-512x512.png',
  '/apple-icon.png',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/favicon.ico',
  '/nexlyte.png',
  '/placeholder-logo.png',
  '/placeholder-logo.svg',
  '/placeholder-user.jpg',
  '/placeholder.jpg',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.log('SW Cache on Install failed: ', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. Only intercept GET requests (Cache storage API only supports GET requests)
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Skip non-HTTP/HTTPS protocols (like ws:// for HMR, wss://, chrome-extension://, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // 3. Skip hot-reloading (HMR) and Next.js internal development requests (/_next/...)
  if (url.includes('/_next/') || url.includes('webpack-hmr')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Cache miss - fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Save it to cache for offline use
                cache.put(event.request, responseToCache);
              })
              .catch((err) => console.log('Failed to cache resource:', err));

            return response;
          })
          .catch((err) => {
            // Handle offline/network failures gracefully, preventing uncaught console errors
            console.log('SW fetch failed (network offline):', url, err);
            return new Response('Offline resource not found', {
              status: 503,
              statusText: 'Service Unavailable (Offline)'
            });
          });
      })
  );
});
