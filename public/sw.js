const CACHE_NAME = 'gymcoach-v5'
const urlsToCache = ['/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  
  const url = new URL(event.request.url)
  
  // NUNCA interceptar recursos internos de Next.js ni extensiones
  if (url.pathname.startsWith('/_next/') || !['http:', 'https:'].includes(url.protocol)) {
    return
  }

  // Navegación (HTML): Solo red, fallback a offline.html si no hay conexión
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    )
    return
  }

  // Para otros recursos (imágenes, fuentes), intentar red primero
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
