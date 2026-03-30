
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/** Evita que F5 sirva HTML/RSC viejo con cookies nuevas (mezcla admin/cliente hasta un hard refresh). */
const NO_STORE_SHELL =
  'private, no-store, no-cache, must-revalidate, max-age=0'

function isSessionSensitivePath(pathname: string) {
  return (
    pathname.startsWith('/client') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/suspended') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/welcome')
  )
}

function applyNoStoreForSensitiveRoutes(
  request: NextRequest,
  response: NextResponse,
) {
  if (!isSessionSensitivePath(request.nextUrl.pathname)) {
    return response
  }
  response.headers.set('Cache-Control', NO_STORE_SHELL)
  const vary = response.headers.get('Vary')
  if (!vary) {
    response.headers.set('Vary', 'Cookie')
  } else if (
    !vary
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .includes('cookie')
  ) {
    response.headers.append('Vary', 'Cookie')
  }
  return response
}

/** Supabase escribe cookies de refresco en `supabaseResponse` durante `getUser()`. Los redirects deben copiarlas o la sesión se corrompe al recargar. */
function redirectPreservingSupabaseCookies(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  const redirect = NextResponse.redirect(url)
  // Copiar el objeto cookie completo (httpOnly, secure, maxAge, path…) — solo name/value rompe el refresh de Supabase.
  for (const cookie of supabaseResponse.cookies.getAll()) {
    redirect.cookies.set(cookie)
  }
  redirect.headers.set('Cache-Control', NO_STORE_SHELL)
  return redirect
}

export async function middleware(request: NextRequest) {
  // API de validación de invitaciones: pasar directo para evitar latencia
  if (request.nextUrl.pathname === '/api/invitations/validate') {
    return NextResponse.next({ request })
  }

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes that don't require auth
  const publicPaths = ['/auth', '/welcome', '/offline', '/api/invitations']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // If no user and trying to access protected route
  if (!user && !isPublicPath && request.nextUrl.pathname !== '/') {
    return redirectPreservingSupabaseCookies(request, '/auth/login', supabaseResponse)
  }

  // Si no hay usuario, pasar directo (ya manejamos redirect arriba)
  if (!user) {
    return applyNoStoreForSensitiveRoutes(request, supabaseResponse)
  }

  // Get user profile for role and subscription check (solo cuando hay user)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, subscription_status, onboarding_completed')
    .eq('id', user.id)
    .single()

  const role = profile?.role || (user?.user_metadata?.role as string) || 'client'
  const subscriptionStatus = profile?.subscription_status || 'active'
  // Si falla el fetch (ej. RLS), asumir onboarding completo para evitar loops de redirect
  const onboardingCompleted = profileError ? true : (profile?.onboarding_completed ?? false)

  // Check if user is suspended or expired
  const isBlockedStatus = subscriptionStatus === 'suspended' || subscriptionStatus === 'expired'
  
  const isSuspendedAllowedPath = 
    request.nextUrl.pathname.startsWith('/suspended') || 
    request.nextUrl.pathname.startsWith('/messages') ||
    request.nextUrl.pathname.startsWith('/auth')

  if (isBlockedStatus && !isSuspendedAllowedPath) {
    return redirectPreservingSupabaseCookies(request, '/suspended', supabaseResponse)
  }

  // Redirect to onboarding if not completed
  if (
    !onboardingCompleted &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/suspended')
  ) {
    if (role === 'admin') {
      if (!request.nextUrl.pathname.startsWith('/admin/onboarding')) {
        return redirectPreservingSupabaseCookies(request, '/admin/onboarding', supabaseResponse)
      }
    } else if (role === 'client') {
      if (!request.nextUrl.pathname.startsWith('/onboarding')) {
        return redirectPreservingSupabaseCookies(request, '/onboarding', supabaseResponse)
      }
    }
  }

  // Protect admin routes - only admins can access
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return redirectPreservingSupabaseCookies(request, '/client/dashboard', supabaseResponse)
  }

  // Protect receptionist routes
  if (request.nextUrl.pathname.startsWith('/receptionist') && role !== 'receptionist' && role !== 'admin') {
    return redirectPreservingSupabaseCookies(request, '/client/dashboard', supabaseResponse)
  }

  return applyNoStoreForSensitiveRoutes(request, supabaseResponse)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth handles its own redirect/cookies)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (manifest, sw, offline.html, icons)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|offline\\.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
