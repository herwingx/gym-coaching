'use client'

import { useEffect } from 'react'

const SW_RELOAD_GUARD_KEY = 'rucoach-sw-reload-guard-ts'

export function PWASetup() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return
      }

      // En dev el SW + HMR provocan updates constantes; el reload automático puede buclear la app.
      if (process.env.NODE_ENV === 'development') {
        return
      }

      let updateInterval: ReturnType<typeof setInterval> | null = null

      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          updateInterval = setInterval(() => {
            registration.update().catch(() => {})
          }, 60_000)

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                const now = Date.now()
                const last = Number(sessionStorage.getItem(SW_RELOAD_GUARD_KEY) || 0)
                if (now - last < 8000) return
                sessionStorage.setItem(SW_RELOAD_GUARD_KEY, String(now))
                window.location.reload()
              }
            })
          })
        })
        .catch(() => {})

      type DeferredWindow = { deferredPrompt?: Event | null }
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault()
        ;(window as unknown as DeferredWindow).deferredPrompt = e
      }

      const handleAppInstalled = () => {
        ;(window as unknown as DeferredWindow).deferredPrompt = null
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstall)
      window.addEventListener('appinstalled', handleAppInstalled)

      return () => {
        if (updateInterval) clearInterval(updateInterval)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    } catch {
      // PWA is optional - fail silently
    }
  }, [])

  return null
}
