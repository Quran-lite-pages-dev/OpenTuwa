// sw.js
const CACHE_NAME = 'tuwa-offline-v1';
// EXACT path matching your file structure
const OFFLINE_URL = '/assets/ui/err_9391za.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // IMPORTANT: We must cache the offline page during install
            // or we won't have it when we go offline later.
            return cache.add(OFFLINE_URL);
        })
    );
    // Force this SW to become active immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // We only want to intervene on navigation requests (HTML pages)
    // capable of displaying a full error page.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If network fails, return the cached custom offline page
                    return caches.match(OFFLINE_URL);
                })
        );
    }
});