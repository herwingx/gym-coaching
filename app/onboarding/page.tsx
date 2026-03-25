import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { trySkipOnboardingForPreCreatedClient } from '@/app/actions/onboarding'
import { OnboardingFlow } from './onboarding-flow'

export default async function OnboardingPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  
  // Check if onboarding already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, role')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    if (profile.role === 'admin') redirect('/admin/dashboard')
    redirect('/client/dashboard')
  }

  // Admin debe ir a su onboarding especifico
  if (profile?.role === 'admin') {
    redirect('/admin/onboarding')
  }

  // Si el admin pre-creó el cliente con preferencias (goal, experience), omitir onboarding
  const skipResult = await trySkipOnboardingForPreCreatedClient(user.id)
  if (skipResult.skipped) {
    redirect('/client/dashboard')
  }

  return <OnboardingFlow userId={user.id} userEmail={user.email || ''} />
}
