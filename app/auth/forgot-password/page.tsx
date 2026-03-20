'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Dumbbell, ArrowLeft } from 'lucide-react'

function getRedirectUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : 'http://localhost:3000/auth/callback'
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl(),
      })

      if (error) throw error
      setSent(true)
      toast.success('Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ''
      const isRateLimit = msg.toLowerCase().includes('rate limit') || msg.includes('429')
      toast.error(
        isRateLimit
          ? 'Demasiados intentos. Espera un minuto e intenta de nuevo.'
          : 'No pudimos enviar el correo. Revisa el correo e intenta de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">GymCoach</span>
        </div>
        <ThemeToggle />
      </header>

      <main id="main-content" className="flex-1 flex items-center justify-center p-6" tabIndex={-1}>
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">¿Olvidaste tu contraseña?</h1>
            <p className="text-muted-foreground">
              Te enviamos un enlace para restablecerla
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle>Restablecer contraseña</CardTitle>
              <CardDescription>
                {sent
                  ? 'Revisa tu correo y haz clic en el enlace'
                  : 'Ingresa tu email y te enviamos las instrucciones'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Si existe una cuenta con ese email, recibirás un enlace para
                    crear una nueva contraseña. Revisa también la carpeta de
                    spam.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al inicio de sesión
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar enlace'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
