const CACHE_NAME = 'olympian-core-v6';

// We removed the explicit '/index.html' to prevent routing errors on custom domains
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    './assets/8k_sun.jpg',
    './assets/8k_earth_nightmap.jpg',
    './assets/8k_moon.jpg',
    'https://unpkg.com/three@0.160.0/build/three.module.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Forces the new service worker to activate immediately
});

self.addEventListener('fetch', (event) => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).catch(() => {
            // If the network fails, try to return the cached version
            return caches.match(event.request).then((response) => {
                // If we can't find the exact request, default to the root '/'
                return response || caches.match('/');
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Deletes old versions of the cache
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of the page immediately
});
