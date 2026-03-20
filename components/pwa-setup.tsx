'use client'

import { useEffect } from 'react'

export function PWASetup() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return
      }

      let updateInterval: ReturnType<typeof setInterval> | null = null

      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          updateInterval = setInterval(() => {
            registration.update().catch(() => {})
          }, 60_000)

          // Reload when new SW activates (after skipWaiting)
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version ready - could show toast to user; for now we reload
                window.location.reload()
              }
            })
          })
        })
        .catch(() => {})

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault()
        ;(window as unknown as { deferredPrompt?: Event }).deferredPrompt = e
      }

      const handleAppInstalled = () => {
        ;(window as unknown as { deferredPrompt?: Event }).deferredPrompt = null
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
