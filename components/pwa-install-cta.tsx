'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, Share2 } from 'lucide-react'

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'gymcoach-pwa-install-dismissed-v1'

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isWebKit = /WebKit/.test(ua)
  const isCriOS = /CriOS/.test(ua)
  const isFxiOS = /FxiOS/.test(ua)
  return isIOS && isWebKit && !isCriOS && !isFxiOS
}

export function PWAInstallCTA() {
  const [open, setOpen] = useState(false)
  const [deferred, setDeferred] = useState<DeferredPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      setInstalled(isStandalone())
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')

      const onAppInstalled = () => setInstalled(true)
      const onDisplayModeChange = () => setInstalled(isStandalone())

      const onBeforeInstall = (e: Event) => {
        e.preventDefault()
        setDeferred(e as DeferredPromptEvent)
      }

      window.addEventListener('beforeinstallprompt', onBeforeInstall)
      window.addEventListener('appinstalled', onAppInstalled)
      window.matchMedia?.('(display-mode: standalone)')?.addEventListener?.('change', onDisplayModeChange)

      return () => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstall)
        window.removeEventListener('appinstalled', onAppInstalled)
        window.matchMedia?.('(display-mode: standalone)')?.removeEventListener?.('change', onDisplayModeChange)
      }
    } catch {
      // optional
    }
  }, [])

  const canShowBanner = useMemo(() => {
    if (installed) return false
    if (dismissed) return false
    // Android/desktop: show when we have the prompt event.
    if (deferred) return true
    // iOS: no beforeinstallprompt. We show a learn-how banner on Safari.
    if (isIosSafari()) return true
    return false
  }, [installed, dismissed, deferred])

  const onDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  const onInstall = async () => {
    if (!deferred) {
      setOpen(true)
      return
    }
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      }
      setDeferred(null)
      onDismiss()
    } catch {
      // ignore
    }
  }

  if (!canShowBanner) return null

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 px-3 sm:px-4">
        <div className="pointer-events-auto mx-auto w-full max-w-xl">
          <Alert className="border-border/80 shadow-lg ring-1 ring-primary/10">
            <Download aria-hidden />
            <AlertTitle>Instala GymCoach</AlertTitle>
            <AlertDescription>
              <p>
                Acceso más rápido, pantalla completa y sensación de app nativa.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => void onInstall()} className="min-h-11">
                  Instalar
                </Button>
                <Button variant="outline" onClick={onDismiss} className="min-h-11">
                  Ahora no
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar en iPhone / iPad</DialogTitle>
            <DialogDescription>
              iOS no muestra un botón de “Instalar” automático. Para agregarla a tu inicio:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Share2 className="mt-0.5 shrink-0" aria-hidden />
              <p>
                En Safari, toca <span className="font-medium text-foreground">Compartir</span>.
              </p>
            </div>
            <p>
              Luego elige <span className="font-medium text-foreground">Añadir a pantalla de inicio</span>.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="min-h-11">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

