const CACHE_NAME = 'semantic-search-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/add.html',
  '/src/index.js',
  '/src/add.js',
  '/src/storage.js',
  '/src/embeddings.js',
  
  // CDN dependencies
  'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js',
  'https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/vector/index.js',
  'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        // Return cached version if available
        if (cached) {
          return cached;
        }
        // Otherwise fetch from network and cache if it's a CDN URL
        return fetch(event.request).then(response => {
          if (response.ok && event.request.url.includes('cdn.jsdelivr.net')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});
