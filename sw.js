//* sw.js - Comprehensive Offline Caching Strategy */

// 1. VERSION CONTROL & CACHE NAMES
// *** IMPORTANT: Change this version number (v4) every time you update any cached file. ***
const CACHE_VERSION = 'v8';
const CORE_CACHE_NAME = 'core-assets-' + CACHE_VERSION;
const FONT_CACHE_NAME = 'google-fonts-' + CACHE_VERSION;
const ALL_CACHE_NAMES = [CORE_CACHE_NAME, FONT_CACHE_NAME];

// 2. CORE ASSETS TO CACHE (HTML, CSS, JS, local images)
// Based on analysis of your CSS imports and standard practice.
const CORE_FILES_TO_CACHE = [
  // Required for the service worker to function offline
  '/',
  '/index.html',
  // Your main CSS files (assuming they are in the root)
  '/index.css',
  '/index(1).css', // This name might cause issues, verify the actual file path!
  // Your offline UI script
  '/offline-ui.js',
  // Required fonts (if you use custom ones in CSS not linked via Google)
  // Your CSS imports 'Inter', 'Amiri', 'Source Serif 4'. Assuming they are Google Fonts.
  
  // Local Icons/Favicons
  '/favicon.ico',
  '/favicon.png',
  
  // Add any other local images (e.g., '/images/hero.jpg') here
];

// 3. GOOGLE FONTS URLs (Based on 'Inter', 'Amiri', 'Source Serif 4' in your CSS)
const GOOGLE_FONT_URLS = [
    // This is the main stylesheet link from your HTML head
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700&display=swap',
];
// You must include the full URLs for the actual font files too (gstatic.com)
// Note: These URLs can change, so we use a Stale-While-Revalidate strategy in fetch
const GOOGLE_FONT_HOST = 'https://fonts.gstatic.com';


// =================================================================
// 4. INSTALL EVENT: Cache Core Assets
// =================================================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing New Version:', CACHE_VERSION);
  self.skipWaiting(); // Force the waiting service worker to become the active one immediately

  event.waitUntil(
    // 4.1 Cache the main core files
    caches.open(CORE_CACHE_NAME).then((coreCache) => {
      console.log('[SW] Caching core files');
      return coreCache.addAll(CORE_FILES_TO_CACHE);
    }).then(() => {
        // 4.2 Cache the Google Font stylesheets (so the browser doesn't try to fetch them later)
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
      // Take control of the page immediately after activation
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
  // This caches the actual font files coming from gstatic.com
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
    return; // Stop processing this fetch request
  }


  // 6.2 Strategy for Core Assets (Cache-First)
  // This serves HTML, CSS, JS, and local images
  if (CORE_FILES_TO_CACHE.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Serve from cache if available, otherwise fetch from the network
        return response || fetch(event.request);
      }).catch(() => {
        // Fallback: If both fail, you could serve a true offline page here
        return caches.match('/index.html'); // Fallback to the homepage
      })
    );
    return; // Stop processing this fetch request
  }
});
