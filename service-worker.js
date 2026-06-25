const CACHE_NAME = 'fitness-tracker-v6';
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

// Activate: clean up old caches and take control immediately
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

// Fetch: network-first strategy (try network, fall back to cache)
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and Google API calls
    if (event.request.method !== 'GET' || event.request.url.includes('googleapis.com') || event.request.url.includes('accounts.google.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Got a good response, cache it for offline use
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache (offline mode)
                return caches.match(event.request);
            })
    );
});
