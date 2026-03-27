const CACHE_NAME = 'gymcoach-v6'
const ASSET_CACHE = 'gymcoach-assets-v1'
const IMAGE_CACHE = 'gymcoach-images-v1'

const urlsToCache = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable.png',
  '/apple-icon.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => ![CACHE_NAME, ASSET_CACHE, IMAGE_CACHE].includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  
  const url = new URL(event.request.url)
  
  // Ignore Next.js internal resources and non-http/https
  if (url.pathname.startsWith('/_next/') || !['http:', 'https:'].includes(url.protocol)) {
    return
  }

  // 1. Navigation strategy: Network-First, fallback to offline.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    )
    return
  }

  // 2. Image strategy: Cache-First
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        })
      })
    )
    return
  }

  // 3. Static assets (JS/CSS/Fonts): Stale-While-Revalidate
  if (
    event.request.destination === 'script' || 
    event.request.destination === 'style' || 
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
          return cachedResponse || fetchPromise
        })
      })
    )
    return
  }

  // 4. Default: Network-First
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
