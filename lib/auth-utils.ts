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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Rol efectivo alineado con `proxy.ts`: si falla `profiles` (RLS/red), no devolver `null`
 * o los layouts mandan a `/auth/login` con sesión aún válida → bucles y “logout” fantasma.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const fromRow = data?.role
  if (fromRow === 'admin' || fromRow === 'client' || fromRow === 'receptionist') {
    return fromRow
  }

  const fromMeta = user.user_metadata?.role
  if (fromMeta === 'admin' || fromMeta === 'client' || fromMeta === 'receptionist') {
    return fromMeta
  }

  if (error) {
    console.error('Error fetching profile role:', error)
  }

  return 'client'
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
