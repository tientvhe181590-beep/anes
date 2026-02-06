/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Precache static assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// API calls: Network-first (try network, fallback to cache)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  }),
);

// Exercise videos & images: Cache-first (use cache, update in background)
registerRoute(
  ({ request }) =>
    request.destination === 'image' ||
    request.destination === 'video' ||
    request.url?.includes('/assets/exercises/'),
  new CacheFirst({
    cacheName: 'media-cache',
    matchOptions: {
      ignoreVary: true,
    },
  }),
);

// Handle navigation requests (SPA fallback)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
  }),
);
