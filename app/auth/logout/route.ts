import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  try {
    await supabase.auth.signOut()
  } catch {
    // Ignorar errores, redirigir de todos modos
  }
  const url = new URL('/auth/login', request.nextUrl.origin)
  const res = NextResponse.redirect(url, 302)
  res.headers.set(
    'Cache-Control',
    'private, no-store, no-cache, must-revalidate, max-age=0',
  )
  return res
}
