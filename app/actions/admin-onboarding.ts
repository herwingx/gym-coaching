'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface AdminOnboardingData {
  userId: string
  gymName: string
  timezone?: string
  currency?: string
}

export async function completeAdminOnboarding(data: AdminOnboardingData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== data.userId) {
    return { success: false, error: 'No autorizado' }
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.userId)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden completar este paso' }
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', data.userId)

  if (profileError) {
    return { success: false, error: 'Error al actualizar el perfil' }
  }

  const { data: existing } = await admin
    .from('gym_settings')
    .select('id')
    .eq('admin_id', data.userId)
    .single()

  if (existing) {
    await admin
      .from('gym_settings')
      .update({
        gym_name: data.gymName,
        timezone: data.timezone || 'America/Mexico_City',
        currency: data.currency || 'MXN',
        setup_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('admin_id', data.userId)
  } else {
    await admin.from('gym_settings').insert({
      admin_id: data.userId,
      gym_name: data.gymName,
      timezone: data.timezone || 'America/Mexico_City',
      currency: data.currency || 'MXN',
      setup_completed: true,
    })
  }

  return { success: true }
}
