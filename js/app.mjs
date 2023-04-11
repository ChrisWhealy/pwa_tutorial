const swName = '/sw.mjs'

// I can haz service worker?
// Must be invoked from a <script> tag with "defer"
if ('serviceWorker' in navigator) {
  navigator
    .serviceWorker
    .register(swName, { type: 'module' })
    .then(async _swReg => console.log(`Service worker ${swName} registered`))
    .catch(err => console.error(`ERROR: Unable to register service worker ${swName}\n`, err))
} else {
  console.error('Your browser does not support service workers; therefore, this app cannot operate in offline mode')
}
