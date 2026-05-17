// SplitWise Service Worker - App Shell + Runtime Caching for Full Offline Support
const CACHE_NAME = 'splitwise-v4';

// Core app shell - these MUST be cached on install for offline to work
const APP_SHELL = [
  './',
  './index.html',
  'manifest.json',
  'icon-512x512.png',
  'apple-icon.png',
  'icon-light-32x32.png',
  'icon-dark-32x32.png',
  'favicon.ico',
  'nexlyte.png'
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
// Pre-cache the app shell. Use individual try/catch so one failing asset
// doesn't block the whole install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url).catch((e) => {
          console.warn('SW: failed to pre-cache', url, e);
        }))
      );
      console.log('SW: install pre-cache done', results.length, 'items');
    })
  );
  // Activate immediately – don't wait for old tabs to close
  self.skipWaiting();
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
// Delete every cache that doesn't match our current CACHE_NAME
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) requests (ws://, chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Skip Next.js HMR websocket / dev-only paths
  if (url.pathname.includes('webpack-hmr')) return;

  // ── Strategy: Cache-First with Network Fallback ──────────────────────────
  // 1. Serve from cache instantly if available (works offline)
  // 2. In parallel, refresh the cache entry from network when online
  // 3. If both cache AND network fail → return the cached root HTML
  //    so the user always sees the app, not a browser error page
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((networkResponse) => {
          // Only cache valid same-origin or CORS responses
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null); // Network is offline – that's fine

      // Return cached immediately; network refresh happens in background
      if (cached) {
        // Kick off background refresh but don't await it
        networkFetch;
        return cached;
      }

      // Nothing in cache yet – wait for network
      const networkResponse = await networkFetch;
      if (networkResponse) return networkResponse;

      // Absolute last resort: return the cached root page
      // This prevents iPhone from showing the Safari offline screen
      const fallback = await cache.match('./') ||
                       await cache.match('./index.html');
      if (fallback) return fallback;

      // Return a minimal offline response
      return new Response(
        '<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>You are offline</h2><p>Please reconnect and reload.</p></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html' } }
      );
    })
  );
});
