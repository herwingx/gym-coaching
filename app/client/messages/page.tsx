import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatViewLazy } from '@/components/chat/chat-view-lazy'
import Link from 'next/link'
import { ArrowLeft, UserRoundSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

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
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <header className="safe-area-header-pt flex shrink-0 items-center gap-2 border-b bg-background/95 px-3 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
          <SidebarTrigger className="-ml-1 size-9 shrink-0 sm:size-8" aria-label="Abrir menú" />
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/client/dashboard" aria-label="Volver al inicio">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="min-w-0 truncate text-base font-semibold tracking-tight">Mensajes</h1>
        </header>
        <Empty className="flex-1 border-0 bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRoundSearch />
            </EmptyMedia>
            <EmptyTitle>Sin coach asignado</EmptyTitle>
            <EmptyDescription>
              Cuando tu entrenador te vincule a su gimnasio o completes una invitación, podrás
              chatear aquí en tiempo real.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/client/dashboard">Ir al panel</Link>
            </Button>
          </EmptyContent>
        </Empty>
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
