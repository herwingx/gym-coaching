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

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile()
  return profile?.role ?? null
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
