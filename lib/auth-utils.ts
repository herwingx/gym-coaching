import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types'

export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const data = await getAuthData()
  return data.profile
}

/**
 * Combined data to avoid redundant calls to getUser and profiles table.
 * Next.js 15/16 benefits from fewer sequential awaits in server components.
 */
export async function getAuthData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, role: null, profile: null }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
  }

  let role: UserRole | null = null
  const fromRow = profile?.role
  if (fromRow === 'admin' || fromRow === 'client' || fromRow === 'receptionist') {
    role = fromRow
  } else {
    const fromMeta = user.user_metadata?.role
    if (fromMeta === 'admin' || fromMeta === 'client' || fromMeta === 'receptionist') {
      role = fromMeta
    } else {
      role = 'client'
    }
  }

  return { user, role, profile }
}

/**
 * Rol efectivo alineado con `middleware.ts`: si falla `profiles` (RLS/red), no devolver `null`
 * o los layouts mandan a `/auth/login` con sesión aún válida → bucles y “logout” fantasma.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const data = await getAuthData()
  return data.role
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

export async function isClient(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'client'
}

export async function isReceptionist(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'receptionist'
}
