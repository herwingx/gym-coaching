'use server'

import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { FitnessGoal, ExperienceLevel } from '@/lib/types'

interface OnboardingData {
  userId: string
  fullName: string
  username: string
  fitnessGoal: FitnessGoal
  experienceLevel: ExperienceLevel
  notificationsEnabled?: boolean
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  // Verificar que el usuario autenticado sea el que actualiza su propio perfil
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== data.userId) {
    return { success: false, error: 'No autorizado' }
  }

  const admin = createAdminClient()

  // Check if username is available
  const { data: existingUser } = await admin
    .from('profiles')
    .select('id')
    .eq('username', data.username)
    .neq('id', data.userId)
    .single()

  if (existingUser) {
    return { success: false, error: 'Este nombre de usuario ya esta en uso' }
  }

  // Update profile (admin bypassa RLS, evita recursión)
  const profileUpdate: Record<string, unknown> = {
    full_name: data.fullName,
    username: data.username,
    fitness_goal: data.fitnessGoal,
    experience_level: data.experienceLevel,
    onboarding_completed: true,
    xp_points: 0,
    level: 1,
    streak_days: 0,
  }
  if (typeof data.notificationsEnabled === 'boolean') {
    profileUpdate.notifications_enabled = data.notificationsEnabled
  }
  const { error: profileError } = await admin
    .from('profiles')
    .update(profileUpdate)
    .eq('id', data.userId)

  if (profileError) {
    console.error('Profile update error:', profileError)
    return { success: false, error: 'Error al actualizar el perfil' }
  }

  // Create client record if doesn't exist
  const { data: existingClient } = await admin
    .from('clients')
    .select('id')
    .eq('user_id', data.userId)
    .single()

  if (!existingClient) {
    const { data: profile } = await admin
      .from('profiles')
      .select('invited_by')
      .eq('id', data.userId)
      .single()

    let coachId = profile?.invited_by as string | null
    if (!coachId) {
      const { data: firstAdmin } = await admin
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle()
      coachId = firstAdmin?.id ?? null
    }

    if (coachId) {
      const { error: clientError } = await admin
        .from('clients')
        .insert({
          id: randomUUID(),
          user_id: data.userId,
          coach_id: coachId,
          full_name: data.fullName,
          phone: '',
          email: user.email || '',
          goal: data.fitnessGoal,
          experience_level: data.experienceLevel,
          status: 'active',
        })

      if (clientError) {
        console.error('Client creation error:', clientError)
        // Don't fail the whole onboarding for this
      }
    }
  }

  return { success: true }
}
