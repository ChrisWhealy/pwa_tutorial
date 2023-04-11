import {
  dynamicCacheLimit,
  noCacheUrlFragments,
  staticAssets,
  genStaticCacheName,
  genDynamicCacheName,
  getFallbackUrlFor,
} from '/js/cacheConfig.mjs'

const appName = 'food-ninja'
const appVersion = 'v1'

const staticCacheName = genStaticCacheName(appName, appVersion)
const dynamicCacheName = genDynamicCacheName(appName, appVersion)
const genEventMsg = evt =>
  `Service worker event "${evt.type}" ${evt.request && evt.request.url ? ` ${evt.request.url}` : ""}\n`

// Lower bound is included but upper bound is excluded
const isBetween = (lower, upper) => val => lower <= val && upper > val
const isHttpSuccess = isBetween(200, 300)

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
const limitCacheSize = async (cacheName, itemCount) =>
  caches
    .open(cacheName)
    .then(cache => cache
      .keys()
      .then(keys => {
        if (keys.length > itemCount) {
          console.log("Trimming cache ", keys[0])
          cache
            .delete(keys[0])
            .then(limitCacheSize(cacheName, itemCount))
        }
      }))

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
self.addEventListener('install', evt => {
  console.log(genEventMsg(evt))

  self.skipWaiting() // Auto-update every time service worker changes

  // The service worker install phase must run to completion (I.E. the static cache must be fully populated) before the
  // browser suspends the thread
  evt.waitUntil(
    caches
      .open(staticCacheName)
      .then(cache => {
        console.log('Populating static Cache')
        cache.addAll(staticAssets)
      })
    // Load static cache assets individually simply to log each fetch event
    // .then(cache => Promise.all(
    //   staticAssets.map(assetName => {
    //     console.log(`Static Cache: Adding ${assetName}`)
    //     return cache
    //       .add(assetName)
    //       .catch(err => console.error(`Static Cache Error: failed to add ${assetName}`, err))
    //   }))
    // )
  )
})

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
const oldCaches = cacheName => cacheName.startsWith(appName) && !cacheName.endsWith(appVersion)

self.addEventListener('activate', evt => {
  console.log(genEventMsg(evt))

  // Clean up any old caches
  evt.waitUntil(
    caches
      .keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(oldCaches)
          .map(oldCacheName => {
            console.log(`Deleting old cache "${oldCacheName}"`)
            caches.delete(oldCacheName)
          }))
      ))
})

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// To cache, or not to cache; that is the question...
// Whether 'tis nobler in the mind to suffer the slings and arrows of outrageously slow network requests,
// Or to take up arms against a sea of out of date cache content and by opposing refresh them?
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
self.addEventListener('fetch', async evt => {
  let logMsg = genEventMsg(evt)

  if (noCacheUrlFragments.filter(urlFragment => evt.request.url.indexOf(urlFragment) !== -1).length === 0) {
    evt.respondWith(
      (async () => {
        logMsg += "Static Cache : "

        let response = await caches
          .match(evt.request, { cacheName: staticCacheName, ignoreVary: true })
          .then(async cachedResponse => {
            if (cachedResponse) {
              logMsg += "Hit"

              return cachedResponse
            } else {
              logMsg += "Miss\n"

              return await caches
                .match(evt.request, { cacheName: dynamicCacheName, ignoreVary: true })
                .then(async cachedResponse => {
                  logMsg += "Dynamic Cache : "

                  if (cachedResponse) {
                    logMsg += "Hit"

                    return cachedResponse
                  } else {
                    logMsg += "Miss\nFetch : "

                    return await fetch(evt.request)
                      .then(async fetchResponse => {
                        // I can haz page from server?
                        if (isHttpSuccess(fetchResponse.status)) {
                          logMsg += `HTTP ${fetchResponse.status} ${fetchResponse.url}\n`

                          // Store HTTP 2nn response in the dynamic cache
                          return await caches
                            .open(dynamicCacheName)
                            .then(cache => {
                              logMsg += `Adding ${evt.request.url} to ${dynamicCacheName} cache\n`
                              // No need to use await here as we don't care how long it takes
                              // to add this response to the cache
                              cache.put(evt.request.url, fetchResponse.clone())
                            })
                            .then(async () => {
                              logMsg += `Limiting ${dynamicCacheName} to ${dynamicCacheLimit} items\n`
                              limitCacheSize(dynamicCacheName, dynamicCacheLimit)
                              return fetchResponse
                            })
                        } else {
                          logMsg += `Error HTTP ${fetchResponse.status} for ${evt.request.url}\n`
                          return await caches.match(getFallbackUrlFor(evt.request))
                        }
                      })
                      // Catch any requests made whilst offline...
                      .catch(async () => {
                        logMsg += `Failed (Offline?)\nFallback : Returning ${getFallbackUrlFor(evt.request)} instead\n`
                        return await caches.match(getFallbackUrlFor(evt.request))
                      })
                  }
                })

            }
          })

        console.log(logMsg)
        return response
      })()
    )
  } else {
    console.log(`${logMsg}This request will not be cached`)
  }
})
