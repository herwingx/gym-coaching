import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
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
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Si no hay usuario, pasar directo (ya manejamos redirect arriba)
  if (!user) {
    return supabaseResponse
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
    const url = request.nextUrl.clone()
    url.pathname = '/suspended'
    return NextResponse.redirect(url)
  }

  // Redirect to onboarding if not completed
  if (
    !onboardingCompleted &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/suspended')
  ) {
    const url = request.nextUrl.clone()
    if (role === 'admin') {
      if (!request.nextUrl.pathname.startsWith('/admin/onboarding')) {
        url.pathname = '/admin/onboarding'
        return NextResponse.redirect(url)
      }
    } else if (role === 'client') {
      if (!request.nextUrl.pathname.startsWith('/onboarding')) {
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    }
  }

  // Protect admin routes - only admins can access
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/client/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect receptionist routes
  if (request.nextUrl.pathname.startsWith('/receptionist') && role !== 'receptionist' && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/client/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
