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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Dumbbell } from 'lucide-react'
import { PasswordInput, getPasswordRequirements, isPasswordValid } from '@/components/ui/password-input'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      if (!session) {
        router.replace('/auth/forgot-password')
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden. Escríbelas igual en ambos campos.')
      return
    }
    const req = getPasswordRequirements(password)
    if (!isPasswordValid(req)) {
      toast.error('La contraseña debe cumplir todos los requisitos indicados abajo.')
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
      router.push('/auth/login')
      router.refresh()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ''
      const isRateLimit = msg.toLowerCase().includes('rate limit') || msg.includes('429')
      toast.error(
        isRateLimit
          ? 'Demasiados intentos. Espera un minuto e intenta de nuevo.'
          : 'No pudimos actualizar la contraseña. Intenta de nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) return null

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
            <h1 className="text-3xl font-bold">Nueva contraseña</h1>
            <p className="text-muted-foreground">
              Elige una contraseña segura
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle>Restablecer contraseña</CardTitle>
              <CardDescription>
                Ingresa tu nueva contraseña dos veces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <PasswordInput
                    id="confirm"
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  disabled={isLoading || !isPasswordValid(getPasswordRequirements(password)) || password !== confirmPassword}
                >
                  {isLoading ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
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
