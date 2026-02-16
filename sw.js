// sw.js
const CACHE_NAME = 'tuwa-offline-v1';
const OFFLINE_URL = '/assets/ui/err_9391za.html';

// 1. INSTALL: Cache the offline page immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(OFFLINE_URL);
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
    self.clients.claim();
});

// 3. FETCH: The "Interceptor"
self.addEventListener('fetch', (event) => {
    // We only care about HTML page navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // NETWORK FAILED (OFFLINE)
                    // Return the cached custom error page instead
                    return caches.match(OFFLINE_URL).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Fallback if even the error page isn't cached (rare)
                        return new Response("Offline - Connection Error", { status: 503 });
                    });
                })
        );
    }
    // For images/css/js, let them fail naturally or add caching logic here if needed
});