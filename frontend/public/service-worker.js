const CACHE_NAME = 'renta-cache-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

// Network-first for navigations so updates show up quickly; cache-first for
// same-origin app-shell assets. Everything else (Supabase's API, any
// cross-origin request, and any non-GET) is left completely untouched — this
// app's data is live, not something a service worker should ever decide to
// serve stale. Cross-origin + non-GET requests are never cached: the Cache
// API only supports GET, and caching an API response would silently freeze
// the app on whatever data existed the first time that URL was ever fetched.
self.addEventListener('fetch', (event) => {
  const { request } = event
  const isSameOrigin = new URL(request.url).origin === self.location.origin

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html')),
    )
    return
  }

  if (!isSameOrigin || request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).then((res) => {
      const clone = res.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
      return res
    })),
  )
})
