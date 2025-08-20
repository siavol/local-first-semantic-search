const CACHE_NAME = 'semantic-search-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/add.html',
  '/src/index.js',
  '/src/add.js',
  '/src/storage.js',
  '/src/embeddings.js'
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
      .then(response => response || fetch(event.request))
  );
});
