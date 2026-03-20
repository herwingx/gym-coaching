import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserProfileContent } from './user-profile-content'

export default async function ClientProfilePage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu información personal</p>
        </div>
      </header>

      <main id="main-content" className="container py-8 max-w-2xl" tabIndex={-1}>
        <UserProfileContent initialProfile={profile} userId={user.id} userEmail={user.email} />
      </main>
    </div>
  )
}
