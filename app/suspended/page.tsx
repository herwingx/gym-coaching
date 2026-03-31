'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, LogOut, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function SuspendedPage() {
  return (
    <div id="main-content" role="main" className="min-h-dvh bg-background flex items-center justify-center p-6" tabIndex={-1}>
      <Card className="w-full max-w-md text-center border-destructive/20 shadow-2xl shadow-destructive/10">
        <CardHeader className="pb-4">
          <div className="mx-auto size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6 ring-1 ring-destructive/20">
            <AlertTriangle className="size-10 text-destructive animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tighter">Acceso Restringido</CardTitle>
          <CardDescription className="text-base font-medium">
            Tu acceso a <span className="text-foreground font-bold">RU Coach</span> ha sido temporalmente suspendido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="p-5 bg-muted/50 rounded-xl text-left space-y-3 border border-border/50">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estado de la cuenta:</p>
            <ul className="text-sm text-foreground/80 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-destructive" />
                Pago de suscripción pendiente
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-destructive" />
                Periodo de prueba finalizado
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-destructive" />
                Revisión administrativa necesaria
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2 h-12 text-base font-bold uppercase tracking-tight" variant="default" asChild>
              <Link href="/messages">
                <MessageCircle className="size-5" />
                Contactar a Rodrigo Urbina
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full gap-2 h-12 text-sm font-semibold" asChild>
              <Link href="/auth/logout" prefetch={false}>
                <LogOut className="size-4" />
                Cerrar Sesión
              </Link>
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Rodrigo Urbina - Coaching de Élite
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
