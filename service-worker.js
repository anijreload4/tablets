/**
 * Tablets & Trials: The Covenant Quest
 * Service Worker for Offline Functionality
 */

const CACHE_NAME = 'tablets-trials-v2'; // Changed version to force cache refresh

// Assets to cache on install (exclude all audio and large files)
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
  '/js/ui/ui-manager.js'
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
        // Add explicit no-cache to ensure we get fresh content
        return fetch(new Request(url, { cache: 'no-cache' }))
          .then(response => {
            // Only cache successful, complete responses
            if (response.ok && response.status === 200) {
              return cache.put(url, response);
            }
            console.warn(`[Service Worker] Failed to cache: ${url} - Status: ${response.status}`);
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
  
  // Skip audio files completely - don't try to cache them
  if (event.request.url.match(/\.(mp3|ogg|wav)$/i)) {
    return; // Let the browser handle audio files directly
  }
  
  // For HTML pages - network first, then cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Only cache complete responses with 200 status
          if (response.ok && response.status === 200) {
            let responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
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
            // Skip caching if response is not complete (status 200)
            if (!response.ok || response.status !== 200) {
              return response;
            }
            
            // Don't cache large files and media
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|mp4|webm|mp3|ogg|wav)$/i)) {
              return response;
            }
            
            // Cache the response
            let responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch error:', error);
            
            // For image requests, try to return a fallback image
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
              return caches.match('/assets/images/ui/fallback-image.svg').then(fallbackResponse => {
                return fallbackResponse || new Response('Image not found', { status: 404 });
              });
            }
            
            // Otherwise just propagate the error
            throw error;
          });
      })
  );
});