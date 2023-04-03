const appName = 'food-ninja'
const appVersion = 'v2'

const staticCacheName = `${appName}-static-${appVersion}`
const dynamicCacheName = `${appName}-dynamic-${appVersion}`

const dynamicCacheLimit = 20

const htmlFallbackUrl = '/pages/fallback.html'
const imgFallbackUrl = '/img/image-missing.png'
const cssFallbackUrl = '/css/empty.css'
const jsFallbackUrl = '/js/empty.js'

const noCacheUrls = [
  'google.firestore',
  'firestore.googleapis.com',
  '/images/cleardot.gif',
]

const staticAssets = [
  // PWA
  '/manifest.json',
  // A service worker's 'fetch' event is not triggered when fetching itself.  This then excludes the possibility of it
  // serving an old copy of itself from the cache.  Thus, caching sw.js is not a problem.
  '/sw.js',

  // HTML
  htmlFallbackUrl,
  '/',
  '/index.html',

  // CSS
  cssFallbackUrl,
  '/css/materialize.min.css',
  '/css/styles.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',

  // Typefaces (for material icons)
  'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',

  // JavaScript
  jsFallbackUrl,
  '/js/app.js',
  '/js/materialize.min.js',
  '/js/ui.js',

  // Images
  imgFallbackUrl,
  '/img/dish.png',
  '/img/icons/icon-144x144.png',
]

const requestFor = fileTypes => req => fileTypes.filter(fType => req.url.indexOf(fType) > -1)
const isImageRequest = requestFor(['.png', '.jpg', '.jpeg', '.gif', '.ico'])
const isHtmlRequest = requestFor(['.html', '.htm'])
const isStyleRequest = requestFor(['.css', 'icon?family'])
const isJsRequest = requestFor(['.js', '.mjs'])

const getFallbackUrl = req =>
  isHtmlRequest(req)
    ? htmlFallbackUrl
    : isImageRequest(req)
      ? imgFallbackUrl
      : isStyleRequest(req)
        ? cssFallbackUrl
        : isJsRequest(req)
          ? jsFallbackUrl
          : htmlFallbackUrl

const oldCaches = cacheName =>
  (cacheName.startsWith(`${appName}-static-`) || cacheName.startsWith(`${appName}-dynamic-`)) &&
  !cacheName.endsWith(appVersion)

const limitCacheSize = (cacheName, itemCount) =>
  caches
    .open(cacheName)
    .then(cache => cache
      .keys()
      .then(keys => {
        if (keys.length > itemCount) {
          cache
            .delete(keys[0])
            .then(limitCacheSize(cacheName, itemCount))
        }
      }))

self.addEventListener('install', evt => {
  // Ensure the browser does not suspend the service worker until after the static cache has been filled
  evt.waitUntil(
    caches
      .open(staticCacheName)
      .then(cache => {
        console.log('Prefilling static cache')
        cache.addAll(staticAssets)
      })
  )
})

self.addEventListener('activate', evt => {
  // Clean this application's up old caches
  evt.waitUntil(
    caches
      .keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(oldCaches)
          .map(oldCacheName => caches.delete(oldCacheName)))
      )
  )
})

self.addEventListener('fetch', evt => {
  if (noCacheUrls.filter(urlFragment => evt.request.url.indexOf(urlFragment) !== -1).length === 0) {
    evt.respondWith(
      caches
        .match(evt.request)
        .then(cacheResponse => cacheResponse ||
          // If we get a cache miss, then try to fetch the asset.
          fetch(evt.request)
            .then(fetchResponse =>
              // Store the response in the dynamic cache
              caches
                .open(dynamicCacheName)
                .then(cache => {
                  console.log(`Adding ${evt.request.url} to ${dynamicCacheName}`)
                  return cache.put(evt.request.url, fetchResponse.clone())
                })
                .then(() => {
                  console.log(`Limiting ${dynamicCacheName} to ${dynamicCacheLimit} items`)
                  limitCacheSize(dynamicCacheName, dynamicCacheLimit)
                  return fetchResponse
                })
            )
            // .catch(() => caches.match(getFallbackUrl(evt.request)))
            .catch(() => caches.match(htmlFallbackUrl))
        )
    )
  }
})
