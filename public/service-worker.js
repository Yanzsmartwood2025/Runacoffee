// This is a basic service worker file for Progressive Web App (PWA) functionality.
// It handles caching of essential files to allow for offline access.

// Define a name for the cache
const CACHE_NAME = 'runa-coffee-cache-v1';

// List the files to be cached on installation
const urlsToCache = [
  '/',
  '/index.html',
  // Add other important assets here like main CSS, JS, and key images
  // For example: '/style.css', '/app.js', 'assets/logo.png'
];

// Install event: triggered when the service worker is first installed.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Add all the specified URLs to the cache
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        // Immediately activate the new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event: triggered when the service worker becomes active.
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // Take control of uncontrolled clients
    return self.clients.claim();
});


// Fetch event: triggered for every network request made by the page.
self.addEventListener('fetch', event => {
    console.log('Service Worker: Fetching:', event.request.url);
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (like loading the main page), use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
        fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // For other requests (CSS, JS, images), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from the cache
        if (response) {
          return response;
        }

        // Not in cache - go to the network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
