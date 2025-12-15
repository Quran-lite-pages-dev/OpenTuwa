/* sw.js - Comprehensive Offline Caching Strategy - FIXED FOR /reading/ SUBDIRECTORY */

// 1. VERSION CONTROL & CACHE NAMES
// *** IMPORTANT: Change this version number (v5) every time you update any cached file. ***
// Changed to v5 to ensure browser detects the fix and re-installs.
const CACHE_VERSION = 'v8';
const CORE_CACHE_NAME = 'core-assets-' + CACHE_VERSION;
const FONT_CACHE_NAME = 'google-fonts-' + CACHE_VERSION;
const ALL_CACHE_NAMES = [CORE_CACHE_NAME, FONT_CACHE_NAME];

// *** BASE PATH CORRECTION ***
// Since your app is in /root/reading/, the base URL for asset paths is '/reading/'
const BASE_PATH = '/reading'; 
// Note: We use BASE_PATH for assets, but '/' in CORE_FILES_TO_CACHE is still needed 
// as it typically maps to the 'index.html' of the scope (i.e., /reading/)

// 2. CORE ASSETS TO CACHE (HTML, CSS, JS, local images)
// All paths are now prefixed with BASE_PATH for correct resolution.
const CORE_FILES_TO_CACHE = [
  // Required for the service worker to function offline
  // The scope's root (often maps to index.html)
  BASE_PATH + '/', 
  BASE_PATH + '/index.html',
  // Your main CSS files
  BASE_PATH + '/index.css',
  BASE_PATH + '/index.js',
  // Your offline UI script
  BASE_PATH + '/offline-ui.js',
  
  // Local Icons/Favicons
  BASE_PATH + '/favicon.ico',
  BASE_PATH + '/favicon.png',
  
  // Add any other local images (e.g., BASE_PATH + '/images/hero.jpg') here
];

// 3. GOOGLE FONTS URLs (Based on 'Inter', 'Amiri', 'Source Serif 4' in your CSS)
const GOOGLE_FONT_URLS = [
    // This is the main stylesheet link from your HTML head
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&display=swap',
];
const GOOGLE_FONT_HOST = 'https://fonts.gstatic.com';


// =================================================================
// 4. INSTALL EVENT: Cache Core Assets
// =================================================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing New Version:', CACHE_VERSION);
  self.skipWaiting(); 

  event.waitUntil(
    // 4.1 Cache the main core files
    caches.open(CORE_CACHE_NAME).then((coreCache) => {
      console.log('[SW] Caching core files');
      // Adding a catch block here for robustness in case some files fail to fetch
      return coreCache.addAll(CORE_FILES_TO_CACHE).catch(error => {
          console.error('[SW] Failed to cache one or more core files:', error);
          // Allow installation to continue even if a non-critical file fails
      });
    }).then(() => {
        // 4.2 Cache the Google Font stylesheets
        return caches.open(FONT_CACHE_NAME).then(fontCache => {
            console.log('[SW] Caching Google Font stylesheets');
            return fontCache.addAll(GOOGLE_FONT_URLS);
        });
    })
  );
});


// =================================================================
// 5. ACTIVATE EVENT: Clean up old caches
// =================================================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating New Version and cleaning up old caches');

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // If the cache name is NOT in our current list, delete it
          if (!ALL_CACHE_NAMES.includes(key)) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});


// =================================================================
// 6. FETCH EVENT: Routing the requests
// =================================================================
self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  // 6.1 Strategy for Google Fonts (Stale-While-Revalidate)
  if (requestURL.host === 'fonts.gstatic.com' || requestURL.host === 'fonts.googleapis.com') {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          
          // Try to fetch from network first (for updates)
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // If fetch succeeds, update the cache with the fresh data
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
             // If network fails, return the cached response (if available)
             return cachedResponse;
          });

          // Return cached response immediately if it exists, otherwise wait for fetch
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }


  // 6.2 Strategy for Core Assets (Cache-First)
  // Check if the requested path is one of our CORE_FILES (now prefixed with /reading)
  if (CORE_FILES_TO_CACHE.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Serve from cache if available, otherwise fetch from the network
        return response || fetch(event.request);
      }).catch(() => {
        // Fallback: If both fail, serve the cached index.html for the subdirectory
        return caches.match(BASE_PATH + '/index.html'); 
      })
    );
    return;
  }
  
  // OPTIONAL: Default Network-First for everything else (e.g., images not listed in CORE_FILES)
  // If a request doesn't match a rule, just let it go to the network.
  // We don't call event.respondWith() so the request goes to the network as normal.
});
