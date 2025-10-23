/* eslint-disable no-restricted-globals */

// Enhanced Service Worker for The Narrow Trail Hiking Portal
// Provides offline capabilities, smart caching, and background sync

// Version management for cache busting
const CACHE_VERSION = '2.2.0'; // Fixed POST request caching error
const CACHE_NAME = `hiking-portal-v${CACHE_VERSION}`;
const API_CACHE = `hiking-api-v${CACHE_VERSION}`;
const IMAGE_CACHE = `hiking-images-v${CACHE_VERSION}`;
const OFFLINE_CACHE = `hiking-offline-v${CACHE_VERSION}`;

// Cache size limits to prevent excessive storage usage
const CACHE_LIMITS = {
  images: 100, // Max 100 images
  api: 50,     // Max 50 API responses
  static: 100  // Max 100 static assets
};

// Precache important assets
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/hiker-favicon.svg',
  '/logo-hiking.svg',
  '/static/css/main.css',
  '/static/js/main.js',
  // Add offline fallback page
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS_TO_CACHE = [
  '/api/hikes',
  '/api/auth/me',
  '/api/users/profile'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Cache app shell
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache.filter(url => !url.includes('css') && !url.includes('js')));
      }),
      // Create offline page
      createOfflinePage()
    ])
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Create offline fallback page
async function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Offline - The Narrow Trail</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #2d5016 0%, #4a7c3d 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 20px; font-size: 2rem; }
        p { margin: 0 0 20px; opacity: 0.9; line-height: 1.5; }
        .icon { font-size: 4rem; margin-bottom: 20px; }
        button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;
        }
        button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🏔️</div>
        <h1>You're Offline</h1>
        <p>You're currently offline, but don't worry! You can still view your cached hikes and use basic features.</p>
        <p>We'll sync your changes when you're back online.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/offline.html', new Response(offlineHTML, {
      headers: { 'Content-Type': 'text/html' }
    }));
  } catch (error) {
    console.warn('[Service Worker] Failed to create offline page:', error);
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match current version
            if (cacheName.includes('hiking-') && !cacheName.includes(CACHE_VERSION)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }),
      // Precache API endpoints
      precacheAPIEndpoints()
    ])
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Precache important API endpoints
async function precacheAPIEndpoints() {
  try {
    const cache = await caches.open(API_CACHE);
    const apiEndpoints = [
      '/api/hikes',
      '/api/auth/me'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response.clone());
          console.log('[Service Worker] Precached API endpoint:', endpoint);
        }
      } catch (error) {
        console.warn('[Service Worker] Failed to precache API endpoint:', endpoint, error);
      }
    }
  } catch (error) {
    console.warn('[Service Worker] Failed to precache API endpoints:', error);
  }
}

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

  // Images - Cache with size management
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Not in cache - fetch and cache
          return fetch(request).then((response) => {
            if (response.status === 200) {
              // Clone and cache the image
              const responseToCache = response.clone();
              cache.put(request, responseToCache).then(() => {
                // Trim cache if it exceeds limit
                trimCache(IMAGE_CACHE, CACHE_LIMITS.images);
              });
            }
            return response;
          }).catch(() => {
            // Could return a fallback placeholder image here
            return new Response('', { status: 404, statusText: 'Image not found' });
          });
        });
      })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  // ONLY cache GET requests to avoid "Request method 'POST' is unsupported" errors
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version and update cache in background (stale-while-revalidate)
          fetch(request).then((response) => {
            if (response.status === 200 && request.method === 'GET') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response).catch((err) => {
                  console.warn('[Service Worker] Failed to cache:', request.url, err);
                });
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

            // Only cache GET requests
            if (request.method === 'GET') {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache).then(() => {
                    // Trim cache if needed
                    trimCache(CACHE_NAME, CACHE_LIMITS.static);
                  }).catch((err) => {
                    console.warn('[Service Worker] Failed to cache:', request.url, err);
                  });
                });
            }

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

// Trim cache to prevent unlimited growth
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxItems) {
      // Delete oldest items (FIFO)
      const itemsToDelete = keys.length - maxItems;
      for (let i = 0; i < itemsToDelete; i++) {
        await cache.delete(keys[i]);
      }
      console.log(`[Service Worker] Trimmed ${itemsToDelete} items from ${cacheName}`);
    }
  } catch (error) {
    console.warn('[Service Worker] Failed to trim cache:', cacheName, error);
  }
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Allow manual cache clearing
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.includes('hiking-')) {
              console.log('[Service Worker] Clearing cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
    );
  }
});

// Enhanced background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  } else if (event.tag === 'sync-hike-interest') {
    event.waitUntil(syncHikeInterests());
  } else if (event.tag === 'sync-profile-updates') {
    event.waitUntil(syncProfileUpdates());
  }
});

// Sync offline actions from IndexedDB
async function syncOfflineActions() {
  try {
    console.log('[Service Worker] Syncing offline actions...');
    
    // Open IndexedDB
    const db = await openOfflineDB();
    const tx = db.transaction(['offlineQueue'], 'readwrite');
    const store = tx.objectStore('offlineQueue');
    
    const actions = await store.getAll();
    console.log('[Service Worker] Found', actions.length, 'actions to sync');
    
    for (const action of actions) {
      try {
        await processOfflineAction(action);
        await store.delete(action.id);
        console.log('[Service Worker] Synced action:', action.type);
      } catch (error) {
        console.warn('[Service Worker] Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

// Process individual offline actions
async function processOfflineAction(action) {
  switch (action.type) {
    case 'hike_interest':
      return await fetch('/api/hikes/' + action.data.hikeId + '/interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + action.data.token
        },
        body: JSON.stringify({ interested: action.data.interested })
      });
      
    case 'profile_update':
      return await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + action.data.token
        },
        body: JSON.stringify(action.data.profileData)
      });
      
    default:
      console.warn('[Service Worker] Unknown action type:', action.type);
  }
}

// Sync hike interests specifically
async function syncHikeInterests() {
  console.log('[Service Worker] Syncing hike interests...');
  // Implementation for syncing hike interests
}

// Sync profile updates specifically
async function syncProfileUpdates() {
  console.log('[Service Worker] Syncing profile updates...');
  // Implementation for syncing profile updates
}

// Open IndexedDB for offline storage
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HikingPortalOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineQueue')) {
        const store = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push message received');
  
  if (event.data) {
    const data = event.data.json();
    
    const title = data.title || 'The Narrow Trail';
    const options = {
      body: data.body || 'New notification',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: data.tag || 'general',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Handle different notification actions
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url || '/')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});

console.log('[Service Worker] Enhanced PWA service worker loaded and ready!');
