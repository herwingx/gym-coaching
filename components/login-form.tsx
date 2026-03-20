'use client'

import { createClient } from '@/lib/supabase/client'
import { syncProfileRole } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', data.user.id)
        .single()

      const metaRole = data.user.user_metadata?.role as string | undefined
      const profileRole = profile?.role
      if (metaRole === 'admin' && profileRole !== 'admin') {
        await syncProfileRole(data.user.id, 'admin')
      }
      const role =
        profileRole === 'admin' || metaRole === 'admin'
          ? 'admin'
          : profileRole === 'receptionist'
            ? 'receptionist'
            : profileRole ?? metaRole ?? 'client'
      const onboardingCompleted = profile?.onboarding_completed ?? false

      toast.success('¡Bienvenido de nuevo!')

      let path = '/client/dashboard'
      if (!onboardingCompleted) {
        path = role === 'admin' ? '/admin/onboarding' : '/onboarding'
      } else if (role === 'admin') {
        path = '/admin/dashboard'
      } else if (role === 'receptionist') {
        path = '/receptionist/dashboard'
      }
      window.location.href = path
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ''
      const isInvalidCreds =
        msg.toLowerCase().includes('invalid') && msg.toLowerCase().includes('credentials')
      const isRateLimit =
        msg.toLowerCase().includes('rate limit') || msg.includes('429')
      toast.error(
        isInvalidCreds
          ? 'Correo o contraseña incorrectos. Verifica tus datos.'
          : isRateLimit
            ? 'Demasiados intentos. Espera un minuto e intenta de nuevo.'
            : 'No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleLogin} className="p-6 md:p-8 flex flex-col justify-center">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-2xl font-bold">Bienvenido</h1>
                <p className="text-balance text-muted-foreground">
                  Tu entrenador digital te espera
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  placeholder="********"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando…' : 'Iniciar sesión'}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/auth/sign-up"
                  className="font-medium text-primary hover:underline"
                >
                  Regístrate
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-linear-to-br from-primary/20 via-background to-primary/5 md:block min-h-[320px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-32 rounded-2xl bg-primary/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-16 text-primary-foreground/80"
                >
                  <path d="M6.5 6.5h.01" />
                  <path d="M14 7V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" />
                  <path d="M14 4v4h4" />
                  <path d="M10 13H8" />
                  <path d="M16 17H8" />
                  <path d="M16 13h-2" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
