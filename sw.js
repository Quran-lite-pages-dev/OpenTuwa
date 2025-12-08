/* sw.js - Service Worker for Offline Mode */
const CACHE_NAME = 'quran-lite-offline-v1';

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Fetch Event - Serve from Cache if available
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. Intercept Audio/Image/Data requests that we have downloaded
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached file if found
            if (cachedResponse) {
                return cachedResponse;
            }
            // Otherwise fetch from network
            return fetch(event.request);
        })
    );
});
