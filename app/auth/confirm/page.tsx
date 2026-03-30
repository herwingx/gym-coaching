'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { syncProfileRole } from '@/app/actions/auth'

/**
 * Procesa el flujo implícito de Supabase: tokens en #hash.
 * El cliente setSession guarda en cookies para que el middleware/SSR funcione.
 */
export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash?.slice(1) : ''
    if (!hash) {
      router.replace('/auth/error?message=' + encodeURIComponent('Enlace inválido o expirado. Verifica que el enlace no haya sido recortado.'))
      return
    }

    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (!accessToken || !refreshToken) {
      setStatus('error')
      router.replace('/auth/error?message=' + encodeURIComponent('Enlace inválido o expirado.'))
      return
    }

    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(async ({ data }) => {
        if (type === 'recovery') {
          router.replace('/auth/reset-password')
          return
        }
        // user_metadata.role como fuente; sincronizar con profiles (middleware lee profiles)
        const userId = data?.user?.id
        const roleFromMeta = data?.user?.user_metadata?.role as string | undefined
        let role = roleFromMeta ?? 'client'

        if (userId && roleFromMeta === 'admin') {
          await syncProfileRole(userId, 'admin')
          role = 'admin'
        }

        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, onboarding_completed')
            .eq('id', userId)
            .single()
          if (profile?.role) role = profile.role
          if (role === 'admin' && profile?.onboarding_completed) {
            router.replace('/admin/dashboard')
            return
          }
        }
        router.replace(role === 'admin' ? '/admin/onboarding' : '/onboarding')
      })
      .catch(() => {
        setStatus('error')
        router.replace('/auth/error?message=' + encodeURIComponent('Error al verificar la sesión.'))
      })
  }, [router])

  return (
    <div id="main-content" role="main" className="flex min-h-dvh items-center justify-center" tabIndex={-1}>
      <p className="text-muted-foreground">
        {status === 'loading' ? 'Verificando tu correo...' : 'Redirigiendo...'}
      </p>
    </div>
  )
}
