
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const NO_STORE_SHELL = 'private, no-store, no-cache, must-revalidate, max-age=0'

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: getUser() refresca la sesión si es necesario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = ['/auth', '/welcome', '/offline', '/api/invitations', '/favicon.ico', '/manifest.json']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Si no hay usuario y no es ruta pública, al login
  if (!user && !isPublicPath && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirect = NextResponse.redirect(url)
    // Copiar cookies de refresco si las hay
    supabaseResponse.cookies.getAll().forEach(c => redirect.cookies.set(c))
    return redirect
  }

  // Para rutas protegidas, asegurar que no haya caché para evitar "ghost logouts"
  if (!isPublicPath) {
    supabaseResponse.headers.set('Cache-Control', NO_STORE_SHELL)
    supabaseResponse.headers.set('Vary', 'Cookie')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|offline\\.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
