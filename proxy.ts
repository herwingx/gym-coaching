
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const NO_STORE_SHELL = 'private, no-store, no-cache, must-revalidate, max-age=0'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.pathname
  console.log(`[Proxy] Request a: ${url}`)

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
          console.log(`[Proxy] Seteando ${cookiesToSet.length} cookies`)
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log(`[Proxy] Usuario: ${user ? user.email : 'No autenticado'}`)

  const publicPaths = ['/auth', '/welcome', '/offline', '/api/invitations', '/favicon.ico', '/manifest.json']
  const isPublicPath = publicPaths.some(path => url.startsWith(path))

  if (!user && !isPublicPath && url !== '/') {
    console.log(`[Proxy] Redirigiendo a login desde ${url}`)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    const redirect = NextResponse.redirect(redirectUrl)
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
