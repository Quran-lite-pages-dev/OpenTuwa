/* swxjs.js - Comprehensive Offline Caching Strategy - FIXED FOR /reading/ SUBDIRECTORY */

// 1. VERSION CONTROL & CACHE NAMES
// *** IMPORTANT: Change this version number (v5) every time you update any cached file. ***
// Changed to v5 to ensure browser detects the fix and re-installs.
const CACHE_VERSION = 'v15';
const CORE_CACHE_NAME = 'core-assets-' + CACHE_VERSION;
const FONT_CACHE_NAME = 'google-fonts-' + CACHE_VERSION;
const ALL_CACHE_NAMES = [CORE_CACHE_NAME, FONT_CACHE_NAME];

// *** BASE PATH CORRECTION ***
// Set to '' for root deployment, or '/subdirectory' if deployed in a subdirectory
// Example: const BASE_PATH = ''; for root, or const BASE_PATH = '/reading'; for subdirectory
const BASE_PATH = ''; 
// Note: We use BASE_PATH for assets. Adjust this if your app is deployed in a subdirectory.

// 2. CORE ASSETS TO CACHE (HTML, CSS, JS, local images)
// All paths are now prefixed with BASE_PATH for correct resolution.
const CORE_FILES_TO_CACHE = [
  // Required for the service worker to function offline
  // The scope's root (often maps to index.html)
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  // CSS files (organized in styles/ directory)
  BASE_PATH + '/styles/b1c2d3e4f5axa.css',
  BASE_PATH + '/styles/a1b2c3d4e5fxa.css',
  BASE_PATH + '/styles/d1e2f3a4b5cxa.css',
  BASE_PATH + '/styles/e1f2a3b4c5dxa.css',
  BASE_PATH + '/styles/f1a2b3c4d5exa.css',
  // JavaScript files (organized in src/ directory)
  BASE_PATH + '/src/core/app_5f6e7dxjs.js',
  BASE_PATH + '/src/components/nav_7c6b5axjs.js',
  BASE_PATH + '/src/components/rec_1a2b3cxjs.js',
  BASE_PATH + '/src/components/arabic_modal_h_9a8b7c.js',
  BASE_PATH + '/src/components/off_4d5e6fxjs.js',
  BASE_PATH + '/src/utils/res_2a3b4cxjs.js',
  BASE_PATH + '/src/utils/ga_9c8b7axjs.js',
  BASE_PATH + '/src/utils/gh_6b5a4cxjs.js',
  BASE_PATH + '/src/utils/swreg_8e7f6axjs.js',
  BASE_PATH + '/src/utils/cp_3c4d5exjs.js',
  BASE_PATH + '/src/components/search/voice_bridge_111aaa.js',
  BASE_PATH + '/src/components/search/grid_nav_222bbb.js',
  
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
