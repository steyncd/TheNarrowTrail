/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here if you have the
// `firebase-messaging-sw.js` script in your service worker.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const CACHE_NAME = 'hiking-portal-v1';
const API_CACHE = 'hiking-api-v1';

// Precache important assets
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/hiker-favicon.svg',
  '/logo-hiking.svg'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // API requests - Network first, cache as fallback
  if (url.origin === 'https://hiking-backend-554106646136.europe-west1.run.app' ||
      request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response because it can only be consumed once
          const responseClone = response.clone();

          // Only cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving API from cache:', request.url);
              return cachedResponse;
            }
            // If no cache, return offline page or error
            return new Response(
              JSON.stringify({ error: 'Offline - no cached data available' }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update cache in background
          fetch(request).then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          }).catch(() => {
            // Network failed, but we have cache - no problem
          });

          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed and no cache - return offline page
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-hike-interest') {
    console.log('[Service Worker] Background sync triggered');
    // Future: sync offline actions when connection returns
  }
});

console.log('[Service Worker] Loaded and ready!');
