'use client'

import { createClient } from '@/lib/supabase/client'
import { useInvitationCode } from '@/app/actions/invitations'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  PasswordInput,
  getPasswordRequirements,
  isPasswordValid,
} from '@/components/ui/password-input'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'

function SignUpFormInner({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [invitationCode, setInvitationCode] = useState('')
  const [isCodeValid, setIsCodeValid] = useState(false)
  const [signUpRole, setSignUpRole] = useState<'admin' | 'client'>('client')
  const [isValidating, setIsValidating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (!codeFromUrl || codeFromUrl.length < 6) return

    setInvitationCode(codeFromUrl.toUpperCase())

    const validate = async () => {
      setIsValidating(true)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const res = await fetch('/api/invitations/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeFromUrl }),
          signal: controller.signal,
        })
        clearTimeout(timeout)
        const text = await res.text()
        let result: {
          valid?: boolean
          error?: string
          invitation?: { email?: string }
          role?: 'admin' | 'client'
        } = {}
        try {
          result = text ? JSON.parse(text) : {}
        } catch {
          throw new Error('Respuesta inválida')
        }
        if (!res.ok) {
          toast.error('No pudimos validar el código. Revisa que sea correcto e intenta de nuevo.')
          setIsCodeValid(false)
          return
        }
        if (result.valid) {
          setIsCodeValid(true)
          if (result.role) setSignUpRole(result.role)
          toast.success(
            result.role === 'admin'
              ? '¡Código de coach válido! Serás el administrador.'
              : '¡Código de invitación válido!'
          )
          if (result.invitation?.email) setEmail(result.invitation.email)
        } else {
          setIsCodeValid(false)
          toast.error('Código no válido. Verifica que esté bien escrito.')
        }
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') {
          toast.error('La validación tardó demasiado. Revisa tu conexión.')
        } else {
          toast.error('No pudimos validar el código. Intenta de nuevo.')
        }
      } finally {
        clearTimeout(timeout)
        setIsValidating(false)
      }
    }
    validate()
  }, [searchParams])

  const handleValidateCode = async (code?: string) => {
    const codeToValidate = code || invitationCode
    if (!codeToValidate || codeToValidate.length < 6) return

    setIsValidating(true)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch('/api/invitations/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToValidate }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const text = await res.text()
      let result: {
        valid?: boolean
        error?: string
        invitation?: { email?: string }
        role?: 'admin' | 'client'
      } = {}
      try {
        result = text ? JSON.parse(text) : {}
      } catch {
        throw new Error('Respuesta inválida')
      }
      if (!res.ok) {
        toast.error('No pudimos validar el código. Intenta de nuevo.')
        setIsCodeValid(false)
        return
      }
      if (result.valid) {
        setIsCodeValid(true)
        if (result.role) setSignUpRole(result.role)
        toast.success(
          result.role === 'admin'
            ? '¡Código de coach válido! Serás el administrador.'
            : '¡Código de invitación válido!'
        )
        if (result.invitation?.email) setEmail(result.invitation.email)
      } else {
        setIsCodeValid(false)
        toast.error('Código no válido. Verifica que sea correcto.')
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        toast.error('La validación tardó demasiado. Revisa tu conexión.')
      } else {
        toast.error('No pudimos validar el código. Intenta de nuevo.')
      }
    } finally {
      clearTimeout(timeout)
      setIsValidating(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCodeValid) {
      toast.error('Necesitas un código de invitación válido para continuar.')
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    if (password !== repeatPassword) {
      toast.error('Las contraseñas no coinciden. Escríbelas igual en ambos campos.')
      setIsLoading(false)
      return
    }

    const req = getPasswordRequirements(password)
    if (!isPasswordValid(req)) {
      toast.error('La contraseña debe cumplir todos los requisitos indicados abajo.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: signUpRole },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })

      if (error) throw error

      if (data.user?.identities?.length === 0) {
        toast.error('Este correo ya está registrado. Inicia sesión o usa otro correo.')
        return
      }

      if (data.user) {
        await useInvitationCode(invitationCode, data.user.id, signUpRole)
      }

      if (data.session) {
        toast.success(
          signUpRole === 'admin' ? '¡Cuenta de coach creada!' : '¡Cuenta creada correctamente!'
        )
        router.push(signUpRole === 'admin' ? '/admin/onboarding' : '/onboarding')
      } else {
        router.push('/auth/sign-up-success')
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ''
      const isRateLimit =
        msg.toLowerCase().includes('rate limit') || msg.includes('429')
      toast.error(
        isRateLimit
          ? 'Demasiados intentos. Espera un minuto e intenta de nuevo.'
          : 'No pudimos crear la cuenta. Revisa tus datos e intenta de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Invitation Code Card - shown first */}
      {!isCodeValid && (
        <Card className="overflow-hidden border-2 border-dashed">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Ticket className="size-5" />
              Código de invitación
            </CardTitle>
            <CardDescription>
              Tu coach te proporcionó un código único para unirte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleValidateCode()
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invitation-code" suppressHydrationWarning>
                    Código
                  </FieldLabel>
                  <Input
                    id="invitation-code"
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    spellCheck={false}
                    placeholder="6-8 caracteres (ej: GYMCOACH)"
                    value={invitationCode}
                    onChange={(e) =>
                      setInvitationCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      )
                    }
                    disabled={isValidating}
                    className="h-12 text-center text-xl font-mono tracking-widest"
                    maxLength={8}
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    disabled={isValidating || invitationCode.length < 6}
                  >
                    {isValidating ? 'Validando…' : 'Validar código'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Registration Form - after valid code */}
      {isCodeValid && (
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-xl overflow-hidden shadow-lg ring-1 ring-border">
                <img 
                  src="/android-chrome-512x512.png" 
                  alt="GymCoach Logo" 
                  className="size-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold tracking-tight">Crea tu cuenta</CardTitle>
                <CardDescription className="truncate">
                  Código validado. Completa tu registro
                </CardDescription>
              </div>
              <div className="px-3 py-1 bg-primary/20 text-primary-foreground text-xs font-medium rounded-full shrink-0">
                Código válido
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
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
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    placeholder="Crea una contraseña segura"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    showValidation
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="repeat-password">
                    Confirmar contraseña
                  </FieldLabel>
                  <PasswordInput
                    id="repeat-password"
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    disabled={
                      isLoading ||
                      !isPasswordValid(getPasswordRequirements(password)) ||
                      password !== repeatPassword
                    }
                  >
                    {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}

      <FieldDescription className="px-6 text-center">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </FieldDescription>
    </div>
  )
}

export function SignupForm(props: React.ComponentProps<'div'>) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Cargando…
        </div>
      }
    >
      <SignUpFormInner {...props} />
    </Suspense>
  )
}
