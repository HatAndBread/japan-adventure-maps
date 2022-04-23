const CACHE_VERSION = 5;
const CURRENT_CACHE = `pedal-party-v-${CACHE_VERSION}`;
const OFFLINE_PAGE_URL = 'offline/offline.html';
const ASSETS_TO_BE_CACHED = [
  OFFLINE_PAGE_URL,
  'offline/offline.css',
  'offline/offline.gif',
  'splashscreens/ipad_splash.png',
  'splashscreens/ipadpro1_splash.png',
  'splashscreens/ipadpro2_splash.png',
  'splashscreens/ipadpro3_splash.png',
  'splashscreens/iphone5_splash.png',
  'splashscreens/iphone6_splash.png',
  'splashscreens/iphoneplus_splash.png',
  'splashscreens/iphonex_splash.png',
  'splashscreens/iphonexr_splash.png',
  'splashscreens/iphonexsmax_splash.png',
  'splashscreens/android-chrome-144x144.png',
  'splashscreens/android-chrome-192x192.png',
  'splashscreens/android-chrome-512x512.png',
  'splashscreens/apple-touch-icon-precomposed.png',
  'splashscreens/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CURRENT_CACHE).then((cache) => {
      // addAll() hits all the URIs in the array and caches
      // the results, with the URIs as the keys.
      cache
        .addAll(ASSETS_TO_BE_CACHED)
        .then(() => console.log('Assets added to cache'))
        .catch((err) => console.log('Error while fetching assets', err));
    })
  );
});

self.addEventListener('activate', (event) => {
  // Delete all caches except for CURRENT_CACHE, thus deleting the previous cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CURRENT_CACHE) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  const request = e.request;
  // If it's a request for an asset of the offline page.
  if (ASSETS_TO_BE_CACHED.some((uri) => request.url.includes(uri))) {
    return e.respondWith(
      caches.match(request).then((response) => {
        // Pull from cache, otherwise fetch from the server.
        return response || fetch(request);
      })
    );
  }

  let response = fetch(request)
    .then((response) => response)
    .catch(() => caches.match(OFFLINE_PAGE_URL));

  e.respondWith(response);
});
