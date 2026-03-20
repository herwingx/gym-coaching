import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminOnboardingFlow } from './admin-onboarding-flow'

export default async function AdminOnboardingPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/client/dashboard')
  }

  if (profile?.onboarding_completed) {
    redirect('/admin/dashboard')
  }

  const { data: gymSettings } = await supabase
    .from('gym_settings')
    .select('gym_name')
    .eq('admin_id', user.id)
    .single()

  return (
    <AdminOnboardingFlow
      userId={user.id}
      gymName={gymSettings?.gym_name || 'Mi espacio'}
    />
  )
}
