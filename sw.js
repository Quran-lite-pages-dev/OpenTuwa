/* sw.js - Complete Version */

// 1. VERSION CONTROL
// Change this string every time you update your CSS, HTML, or JS!
const CACHE_NAME = 'offline-site-v2';

// 2. FILES TO CACHE
// Make sure these paths match your HTML exactly.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline-ui.js',
  '/index.css',      // Ensure your HTML says <link href="index.css">
  '/favicon.ico',
  '/favicon.png'     // If you have images, list them here
];

// 3. INSTALL: Cache the files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing New Version:', CACHE_NAME);
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting(); 

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 4. ACTIVATE: Clean up old caches (The New Part)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating New Version');

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // If the cache name is NOT the current one, delete it
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  // Tell the Service Worker to take control of the page immediately
  return self.clients.claim();
});

// 5. FETCH: Serve offline content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cache if found, otherwise go to network
      return response || fetch(event.request);
    }).catch(() => {
        // Optional: If both fail, you can return a fallback page here
        // return caches.match('/offline.html'); 
    })
  );
});
