import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calculateLevel } from '@/lib/types'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'
import { UserProfileContent } from './user-profile-content'

export default async function ClientProfilePage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('clients').select('id, phone, birth_date, gender').eq('user_id', user.id).maybeSingle(),
  ])

  const levelFromXp = calculateLevel(profile?.xp_points ?? 0).level
  if (profile?.id != null && profile.level !== levelFromXp) {
    await supabase.from('profiles').update({ level: levelFromXp }).eq('id', profile.id)
  }

  const mergedProfile = {
    ...(profile || {}),
    phone: profile?.phone || client?.phone || undefined,
    birth_date: profile?.birth_date || client?.birth_date || undefined,
    gender: profile?.gender || client?.gender || undefined,
    level: levelFromXp,
  }

  return (
    <>
      <ClientStackPageHeader
        title="Mi perfil"
        subtitle="Datos personales, avatar y preferencias de entreno."
      />
      <div className={CLIENT_DATA_PAGE_SHELL}>
        <UserProfileContent
          initialProfile={mergedProfile}
          userId={user.id}
          userEmail={user.email ?? ''}
          clientId={client?.id}
        />
      </div>
    </>
  )
}
