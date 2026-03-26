import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatViewLazy } from '@/components/chat/chat-view-lazy'
import Link from 'next/link'
import { UserRoundSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'

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
      .order('created_at', { ascending: true, nullsFirst: false })
      .limit(1)
      .single()
    coachId = adminProfile?.id
  }

  if (!coachId) {
    return (
      <>
        <ClientStackPageHeader
          title="Mensajes"
          subtitle="Tu chat directo con el coach · avisos, dudas y seguimiento."
        />
        <div className={CLIENT_DATA_PAGE_SHELL}>
          <Empty className="border-border/80 shadow-sm ring-1 ring-primary/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRoundSearch />
              </EmptyMedia>
              <EmptyTitle>Sin coach asignado</EmptyTitle>
              <EmptyDescription>
                Cuando tu entrenador te vincule o completes una invitación, podrás chatear aquí en tiempo real.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link href="/client/dashboard">Ir al panel</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/client/profile">Revisar mi perfil</Link>
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      </>
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
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <ChatViewLazy
        currentUserId={user.id}
        role={role}
        otherUser={otherUser}
        conversations={[]}
      />
    </div>
  )
}
