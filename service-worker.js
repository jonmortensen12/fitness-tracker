const CACHE_NAME = 'fitness-tracker-v4';
const ASSETS_TO_CACHE = [
    '/fitness-tracker/',
    '/fitness-tracker/index.html',
    '/fitness-tracker/styles.css',
    '/fitness-tracker/app.js',
    '/fitness-tracker/google-sheets.js',
    '/fitness-tracker/manifest.json'
];

// Install: cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            // Return cached version, but also fetch fresh copy for next time
            const fetchPromise = fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(() => cached);

            return cached || fetchPromise;
        })
    );
});
