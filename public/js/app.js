const swName = '/sw.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator
      .serviceWorker
      .register(swName)
      .then(_ => console.log(`Service worker ${swName} registered`))
      .catch(err => console.error(`ERROR: Unable to register service worker ${swName}\n`, err))
  )
} else {
  console.error('Since your browser does not support service workers, this app can only operate in online mode')
}
