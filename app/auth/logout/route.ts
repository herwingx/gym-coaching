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
  return NextResponse.redirect(url, 302)
}
