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

const DISMISS_KEY = 'rucoach-pwa-install-dismissed-v1'

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
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [deferred, setDeferred] = useState<DeferredPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setInstalled(isStandalone())
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')

      const onAppInstalled = () => setInstalled(true)
      const onDisplayModeChange = () => setInstalled(isStandalone())

      const onBeforeInstall = (e: Event) => {
        try {
          const wasDismissed = localStorage.getItem(DISMISS_KEY) === '1'
          const alreadyInstalled = isStandalone()

          // Solo interceptamos el banner nativo si vamos a mostrar CTA propia.
          if (wasDismissed || alreadyInstalled) {
            return
          }
        } catch {
          // si localStorage falla, seguimos con la CTA custom
        }

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

  if (!mounted || !canShowBanner) return null

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 px-3 sm:px-4">
        <div className="pointer-events-auto mx-auto w-full max-w-xl">
          <Alert className="border-border/80 shadow-2xl ring-1 ring-primary/20 bg-card/95 backdrop-blur-md">
            <Download className="size-5 text-primary" aria-hidden />
            <AlertTitle className="text-base font-black uppercase tracking-tight">Instala RU Coach</AlertTitle>
            <AlertDescription className="mt-1">
              <p className="text-sm text-muted-foreground font-medium">
                Acceso premium, pantalla completa y experiencia de élite en tu dispositivo.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={() => void onInstall()} className="flex-1 h-10 font-bold uppercase tracking-tighter bg-primary text-primary-foreground hover:bg-primary/90">
                  Instalar App
                </Button>
                <Button variant="ghost" onClick={onDismiss} className="h-10 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent">
                  Ahora no
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl border-border/50 shadow-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Instalar en iOS</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Sigue estos pasos para añadir <span className="text-foreground font-bold text-base">RU Coach</span> a tu inicio:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl border border-border/50">
              <div className="size-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                <Share2 className="size-5 text-primary" />
              </div>
              <p className="text-sm font-semibold">
                1. Toca el botón <span className="text-primary underline underline-offset-4 decoration-2">Compartir</span> en Safari.
              </p>
            </div>
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl border border-border/50">
              <div className="size-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                <div className="size-5 border-2 border-primary rounded flex items-center justify-center">
                  <div className="size-2 bg-primary rounded-full" />
                </div>
              </div>
              <p className="text-sm font-semibold">
                2. Selecciona <span className="text-primary underline underline-offset-4 decoration-2">Añadir a pantalla de inicio</span>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="w-full h-12 font-black uppercase tracking-tighter bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300">
              ¡Entendido!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
