'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, LogOut, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function SuspendedPage() {
  return (
    <div id="main-content" role="main" className="min-h-dvh bg-background flex items-center justify-center p-6" tabIndex={-1}>
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto size-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Cuenta Suspendida</CardTitle>
          <CardDescription className="text-base">
            Tu acceso a GymCoach ha sido temporalmente suspendido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg text-left space-y-2">
            <p className="text-sm font-medium">Posibles razones:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pago de suscripcion pendiente</li>
              <li>• Periodo de prueba finalizado</li>
              <li>• Suspension temporal por el coach</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2" variant="default" asChild>
              <Link href="/messages">
                <MessageCircle className="w-4 h-4" />
                Contactar a mi Coach
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full gap-2" asChild>
              <Link href="/auth/logout">
                <LogOut className="w-4 h-4" />
                Cerrar Sesion
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Si crees que esto es un error, contacta a tu coach para resolver la situacion.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
