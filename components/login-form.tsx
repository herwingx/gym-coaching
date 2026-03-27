'use client'

import { createClient } from '@/lib/supabase/client'
import { syncProfileRole } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
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
    <div className={cn('w-full', className)} {...props}>
      <form onSubmit={handleLogin} className="flex flex-col justify-center">
        <FieldGroup>
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
    </div>
  )
}
