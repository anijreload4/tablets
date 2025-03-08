/**
 * Tablets & Trials: The Covenant Quest
 * Service Worker for Offline Functionality
 */

const CACHE_NAME = 'tablets-trials-v1';

// Assets to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/game-board.css',
  '/css/dialogue.css',
  '/css/journey-map.css',
  '/css/responsive.css',
  '/js/app.js',
  
  // Core module files
  '/js/utils/render-manager.js',
  '/js/services/asset-cache.js',
  '/js/services/save-manager.js',
  '/js/services/error-handler.js',
  '/js/utils/debugging.js',
  '/js/game/board.js',
  '/js/game/tile.js',
  '/js/game/level.js',
  '/js/game/match-engine.js',
  '/js/dialogue/dialogue-manager.js',
  '/js/ui/ui-manager.js',
  
  // Essential assets
  '/assets/fonts/Covenant-Regular.woff2',
  '/assets/fonts/Covenant-Regular.woff',
  '/assets/images/ui/logo.png',
  '/assets/images/ui/button-bg.png',
  '/assets/images/ui/star-empty.svg',
  '/assets/images/ui/star-filled.svg',
  '/assets/images/ui/favicon.png',
  '/assets/images/backgrounds/menu-bg.jpg',
  
  // Tile assets
  '/assets/images/tiles/manna.svg',
  '/assets/images/tiles/water.svg',
  '/assets/images/tiles/fire.svg',
  '/assets/images/tiles/stone.svg',
  '/assets/images/tiles/quail.svg',
  
  // Initial character portraits
  '/assets/images/characters/moses-normal.png',
  '/assets/images/characters/aaron-normal.png',
  
  // Audio files
  '/assets/audio/sfx/button-click.mp3',
  '/assets/audio/music/menu-theme.mp3'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      console.log('[Service Worker] Caching static files');
      
      // Use individual fetch promises that won't fail the entire operation
      const cachePromises = STATIC_CACHE_URLS.map(url => {
        return fetch(url)
          .then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
            console.warn(`[Service Worker] Failed to cache: ${url}`);
            return Promise.resolve(); // Continue despite error
          })
          .catch(error => {
            console.warn(`[Service Worker] Failed to fetch: ${url}`, error);
            return Promise.resolve(); // Continue despite error
          });
      });
      
      return Promise.allSettled(cachePromises)
        .then(results => {
          const successes = results.filter(r => r.status === 'fulfilled').length;
          console.log(`[Service Worker] Cached ${successes} of ${STATIC_CACHE_URLS.length} files`);
        });
    })
    .catch(error => {
      console.error('[Service Worker] Cache setup failure:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For HTML pages - network first, then cache
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          let responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }
  
  // For assets - cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return from cache if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache successful response
            if (response.ok) {
              let responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch error:', error);
            
            // For image requests, return fallback image
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/assets/images/ui/fallback-image.svg');
            }
            
            // For JavaScript or CSS, return empty response to avoid errors
            if (event.request.url.match(/\.(js|css)$/)) {
              return new Response('', { status: 200, headers: { 'Content-Type': 'text/plain' } });
            }
            
            // Otherwise just propagate the error
            throw error;
          });
      })
  );
});

// Background sync for saving game progress when offline
self.addEventListener('sync', event => {
  if (event.tag === 'sync-game-progress') {
    event.waitUntil(
      // Logic to send cached progress to server
      fetch('/api/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: 'sync'
        })
      })
    );
  }
});

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const notification = event.data.json();
  
  const title = notification.title || 'Tablets & Trials';
  const options = {
    body: notification.body || 'New content available!',
    icon: notification.icon || '/assets/images/ui/icon-192.png',
    badge: '/assets/images/ui/badge.png',
    data: notification.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Navigate to specific page if included in notification data
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    // Otherwise open the main app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});