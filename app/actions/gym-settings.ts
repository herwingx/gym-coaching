'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-utils'

export async function updateGymSettings(data: {
  gym_name?: string
  phone?: string
  schedule?: string
  currency?: string
  timezone?: string
}) {
  const user = await getAuthUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Solo administradores pueden editar la configuración' }
  }

  const { data: existing } = await supabase
    .from('gym_settings')
    .select('id')
    .eq('admin_id', user.id)
    .single()

  const payload = {
    gym_name: data.gym_name ?? undefined,
    phone: data.phone ?? undefined,
    schedule: data.schedule ?? undefined,
    currency: data.currency ?? undefined,
    timezone: data.timezone ?? undefined,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { error } = await supabase
      .from('gym_settings')
      .update(payload)
      .eq('admin_id', user.id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('gym_settings').insert({
      admin_id: user.id,
      ...payload,
    })
    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}
