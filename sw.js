/* sw.js */
const CACHE_NAME = 'offline-site-v1';
// List the files you want to work offline
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline-ui.js',
  // Add other CSS or Image files here if needed
];

// 1. Install Service Worker and Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. Serve Cached Files when Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cache if available, otherwise fetch from network
      return response || fetch(event.request);
    }).catch(() => {
        // If both fail, you could return a custom offline.html here
    })
  );
});
