// proxy.ts (En la raíz de tu proyecto o dentro de src/)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const NO_STORE_SHELL = 'private, no-store, no-cache, must-revalidate, max-age=0'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.pathname
  console.log(`[Proxy] Request a: ${url}`)

  // 1. Inicializamos la respuesta base
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Creamos el cliente asegurando que las cookies se propaguen correctamente
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
          
          // A) Actualizamos la petición para que los componentes del servidor vean el cambio
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // B) Refrescamos la respuesta base para que Next.js tome los cambios internos
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // C) Inyectamos las nuevas cookies con sus opciones completas (path, maxAge, etc.)
          // en la respuesta que irá de vuelta al navegador
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Obtenemos el usuario (aquí es donde Supabase evalúa y, si es necesario, refresca el token)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log(`[Proxy] Usuario: ${user ? user.email : 'No autenticado'}`)

  const publicPaths = ['/auth', '/welcome', '/offline', '/api/invitations', '/favicon.ico', '/manifest.json']
  const isPublicPath = publicPaths.some(path => url.startsWith(path))

  // 4. Protección de rutas
  if (!user && !isPublicPath && url !== '/') {
    console.log(`[Proxy] Redirigiendo a login desde ${url}`)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    
    // IMPORTANTE: Creamos la redirección
    const redirectResponse = NextResponse.redirect(redirectUrl)
    
    // TRUCO CRÍTICO PARA EVITAR GHOST LOGOUTS:
    // Al hacer un redirect, perdemos 'supabaseResponse'. Tenemos que transferir 
    // manualmente TODAS las cookies procesadas hacia el objeto 'redirectResponse'.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      // Se pasan las opciones completas para que el navegador no ignore la cookie
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    
    return redirectResponse
  }

  // 5. Prevenir que el navegador guarde en caché el HTML de rutas protegidas
  if (!isPublicPath) {
    supabaseResponse.headers.set('Cache-Control', NO_STORE_SHELL)
    supabaseResponse.headers.set('Vary', 'Cookie')
  }

  return supabaseResponse
}

export const config = {
  // Configuración del Matcher para el proxy
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|offline\\.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
