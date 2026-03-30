export const runtime = 'edge';
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

type EmailOtpType = 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink'

/**
 * Auth callback - soporta PKCE (token_hash en query) e implícito (tokens en hash #).
 * Supabase puede usar flujo implícito por defecto: redirige con #access_token=...
 * El servidor nunca ve el hash, así que devolvemos HTML que lo procesa en el cliente.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const redirectToError = (message: string) =>
    NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(message)}`, origin))

  // Sin token_hash/type: Supabase usó flujo implícito (tokens en #hash).
  // Devolvemos HTML que procesa el hash en el cliente.
  if (!tokenHash || !type) {
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verificando...</title></head>
<body><p>Verificando tu correo...</p>
<script>var h=window.location.hash;window.location.replace("/auth/confirm"+(h||""));<\/script>
</body>
</html>`
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Cliente que escribe cookies en Headers para incluirlas en el redirect
  const headers = new Headers()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(request.headers.get('Cookie') ?? '')
          return parsed.map(({ name, value }) => ({ name, value: value ?? '' }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options ?? {}))
          )
        },
      },
    }
  )

  if (type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    if (error) return redirectToError(error.message)
    const response = NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin))
    headers.forEach((value, key) => response.headers.append(key, value))
    return response
  }

  if (type === 'signup' || type === 'email' || type === 'magiclink') {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'email' | 'magiclink',
    })
    if (error) return redirectToError(error.message)
    const role = data?.user?.user_metadata?.role
    const userId = data?.user?.id

    // Sincronizar profiles.role con user_metadata (proxy lee de profiles)
    if (role === 'admin' && userId) {
      try {
        const admin = createAdminClient()
        await admin.from('profiles').update({ role: 'admin' }).eq('id', userId)
      } catch {
        // Ignorar si falla (ej. sin SUPABASE_SERVICE_ROLE_KEY)
      }
    }

    const path = role === 'admin' ? '/admin/onboarding' : '/onboarding'
    const response = NextResponse.redirect(new URL(path, requestUrl.origin))
    headers.forEach((value, key) => response.headers.append(key, value))
    return response
  }

  return redirectToError('Tipo de enlace no soportado')
}
