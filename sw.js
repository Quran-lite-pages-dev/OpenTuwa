/* sw.js - Comprehensive Offline Caching Strategy */

const CACHE_VERSION = 'v14';
const CORE_CACHE_NAME = 'core-assets-' + CACHE_VERSION;
const ALL_CACHE_NAMES = [CORE_CACHE_NAME];

const BASE_PATH = '';

const CORE_FILES_TO_CACHE = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/styles/index.css',
  BASE_PATH + '/styles/index1.css',
  BASE_PATH + '/styles/custom-select.css',
  BASE_PATH + '/src/core/app.js',
  BASE_PATH + '/src/components/navigation.js',
  BASE_PATH + '/src/components/recommendations.js',
  BASE_PATH + '/src/components/offline-status.js',
  BASE_PATH + '/src/utils/resolution.js',
  BASE_PATH + '/src/utils/github-redirect.js',
  BASE_PATH + '/src/utils/service-worker-registration.js',
  BASE_PATH + '/src/utils/content-protection.js',
  BASE_PATH + '/src/components/search/voice-search-bridge.js',
  BASE_PATH + '/src/components/search/grid-navigation.js',
  BASE_PATH + '/favicon.ico',
  BASE_PATH + '/favicon.png',
];

// Apple SF fonts are system-installed - no external font caching needed

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then((coreCache) => {
      return coreCache.addAll(CORE_FILES_TO_CACHE).catch(error => {
          console.error('[SW] Failed to cache one or more core files:', error);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (!ALL_CACHE_NAMES.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  if (CORE_FILES_TO_CACHE.includes(requestURL.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      }).catch(() => {
        return caches.match(BASE_PATH + '/index.html');
      })
    );
    return;
  }
});
