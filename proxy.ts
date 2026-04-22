import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.pathname
  
  // 1. Respuesta base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Cliente Supabase con lógica de cookies robusta para Vercel
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Actualizar request (para Server Components)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Actualizar response (para el Navegador)
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Obtener usuario (esto dispara setAll si el token expiró)
  const { data: { user } } = await supabase.auth.getUser()

  const publicPaths = ['/auth', '/welcome', '/offline', '/api/invitations', '/favicon.ico', '/manifest.json', '/dev-sw.js']
  const isPublicPath = publicPaths.some(path => url.startsWith(path))

  // 4. Si no hay usuario y es ruta protegida -> Redirigir
  if (!user && !isPublicPath && url !== '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(redirectUrl)
    
    // IMPORTANTE: Copiar cookies a la redirección
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 5. Encabezados de seguridad para evitar caché de sesión
  if (!isPublicPath) {
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Vary', 'Cookie')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|dev-sw\\.js|offline\\.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
