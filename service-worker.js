const CACHE_NAME = 'raahims-arabic-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/sounds/',
  '/images/',
  '/mouths/'
];

// Install event: cache all the assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Fetch event: respond with cached resources first, then update in the background
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a cached response, return it
      if (response) {
        // Update the cache in the background
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          })
        );
        return response;
      }

      // If no cached response, fetch from the network
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

// Activate event: clean up old caches if needed
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.
