const CACHE_NAME = 'gymcoach-v4'
/** Solo recursos estáticos de app shell offline — nunca HTML de rutas autenticadas (evita mezclar sesiones). */
const urlsToCache = ['/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Bundles y flight de Next: sin interceptar — evita JS viejo en caché + HTML nuevo (hidratación rota).
  if (url.pathname.startsWith('/_next/')) {
    return
  }

  if (url.pathname.startsWith('/api/') || url.pathname.includes('/auth/')) {
    return
  }

  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response?.status === 200 && response.type === 'basic') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      }),
    )
    return
  }

  /**
   * Navegación (documentos HTML): solo red — no guardar en Cache API.
   * Guardar respuestas de navigate mezcla sesiones (misma URL, cookies distintas)
   * y puede romper la app al tener admin y cliente en el mismo perfil del navegador.
   */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        credentials: 'same-origin',
      }).catch(() => caches.match('/offline.html')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response?.status === 200 && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      return cached || fetchPromise
    }),
  )
})
