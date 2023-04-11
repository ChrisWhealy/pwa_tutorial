const firebaseVersion = '9.19.1'
const firebaseUrlPrefix = 'https://www.gstatic.com/firebasejs/'
const firebaseUrl = `${firebaseUrlPrefix}${firebaseVersion}`

const requestFor = fileTypes => req => fileTypes.filter(fType => req.url.indexOf(fType) > -1).length > 0
const isImageRequest = requestFor(['.png', '.jpg', '.jpeg', '.gif', '.ico'])
const isHtmlRequest = requestFor(['.html', '.htm'])
const isStyleRequest = requestFor(['.css', 'icon?family'])
const isJsRequest = requestFor(['.js', '.mjs'])

const genCacheOfType = cacheType => (prefix, suffix) => `${prefix}-${cacheType}-${suffix}`
export const genStaticCacheName = genCacheOfType('static')
export const genDynamicCacheName = genCacheOfType('dynamic')

export const dynamicCacheLimit = 20

export const noCacheUrlFragments = [
  'google.firestore',
  'firestore.googleapis.com',
  '/images/cleardot.gif',
]

const htmlFallbackUrl = '/pages/fallback.html'
const imgFallbackUrl = '/img/image-missing.png'
const cssFallbackUrl = '/css/empty.css'
const jsFallbackUrl = '/js/empty.js'

export const getFallbackUrlFor = req =>
  isHtmlRequest(req)
    ? htmlFallbackUrl
    : isImageRequest(req)
      ? imgFallbackUrl
      : isStyleRequest(req)
        ? cssFallbackUrl
        : isJsRequest(req)
          ? jsFallbackUrl
          : htmlFallbackUrl

export const staticAssets = [
  // PWA
  '/manifest.json',
  // A service worker's 'fetch' event is not triggered when fetching itself.  This then excludes the possibility of it
  // serving an old copy of itself from the cache.  Thus, caching sw.js is not a problem.
  '/sw.mjs',

  // HTML
  htmlFallbackUrl,
  '/',
  '/index.html',

  // CSS
  cssFallbackUrl,
  '/css/materialize.css',
  '/css/styles.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',

  // Typefaces (for material icons)
  'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',

  // JavaScript
  jsFallbackUrl,
  '/js/materialize.js',
  '/js/ui.mjs',
  '/js/uiEventHandlers.mjs',
  '/js/db.mjs',
  '/js/app.mjs',
  `${firebaseUrl}/firebase-app.js`,
  `${firebaseUrl}/firebase-firestore.js`,

  // Images
  imgFallbackUrl,
  '/img/dish.png',
  '/img/icons/icon-144x144.png',
]
