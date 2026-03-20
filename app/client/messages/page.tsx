import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatView } from '@/components/chat/chat-view'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ClientMessagesPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'client'

  if (role !== 'client') {
    redirect('/admin/dashboard')
  }

  let otherUser: { id: string; name: string; avatarUrl?: string | null } | null = null

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let coachId: string | null = null

  const { data: clientWithCoach } = await supabase
    .from('clients')
    .select('coach_id')
    .eq('user_id', user.id)
    .single()
  coachId = (clientWithCoach as any)?.coach_id

  if (!coachId) {
    const { data: inv } = await supabase
      .from('invitation_codes')
      .select('created_by')
      .eq('used_by_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    coachId = inv?.created_by
  }

  if (!coachId) {
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('role', 'admin')
      .limit(1)
      .single()
    coachId = adminProfile?.id
  }

  if (!coachId) {
    return (
      <div id="main-content" role="main" className="min-h-dvh flex flex-col bg-background" tabIndex={-1}>
        <header className="flex items-center gap-3 p-4 border-b bg-background shrink-0 safe-area-header-pt">
          <Link href="/client/dashboard" className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">Mensajes</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No hay coach disponible aún.</p>
        </div>
      </div>
    )
  }

  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', coachId)
    .single()

  otherUser = {
    id: coachId,
    name: coachProfile?.full_name || 'Tu coach',
    avatarUrl: coachProfile?.avatar_url,
  }

  return (
    <div id="main-content" role="main" className="flex flex-col h-dvh bg-background" tabIndex={-1}>
      <header className="flex items-center gap-3 p-4 border-b bg-background shrink-0 safe-area-header-pt">
        <Link href="/client/dashboard" className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold">Mensajes</h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatView
          currentUserId={user.id}
          role={role}
          otherUser={otherUser}
          conversations={[]}
        />
      </div>
    </div>
  )
}
