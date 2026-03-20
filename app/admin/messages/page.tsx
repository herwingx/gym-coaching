import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatView } from '@/components/chat/chat-view'

export default async function AdminMessagesPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'client'

  if (role !== 'admin') {
    redirect('/client/dashboard')
  }

  const { data: myClients } = await supabase
    .from('clients')
    .select('id, user_id, full_name')

  let clients = myClients || []

  if (clients.length === 0) {
    const { data: allClients } = await supabase
      .from('clients')
      .select('id, user_id, full_name')
      .not('user_id', 'is', null)
    clients = allClients || []
  }

  const userIds = clients.map((c: any) => c.user_id).filter(Boolean) as string[]
  let conversations: any[] = []

  if (userIds.length > 0) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('from_user_id, to_user_id, content, created_at, is_read')
      .or(`from_user_id.in.(${userIds.join(',')}),to_user_id.in.(${userIds.join(',')})`)
      .order('created_at', { ascending: false })

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]))
    const lastByPeer = new Map<string, { content: string; at: string; unread: number }>()

    const unreadByPeer = new Map<string, number>()
    for (const m of msgs || []) {
      const peerId = m.from_user_id === user.id ? m.to_user_id : m.from_user_id
      if (!lastByPeer.has(peerId)) {
        lastByPeer.set(peerId, {
          content: m.content,
          at: m.created_at,
          unread: 0,
        })
      }
      if (m.to_user_id === user.id && !m.is_read) {
        unreadByPeer.set(peerId, (unreadByPeer.get(peerId) || 0) + 1)
      }
    }
    for (const [pid, last] of lastByPeer) {
      last.unread = unreadByPeer.get(pid) || 0
    }

    conversations = clients
      .filter((c) => c.user_id)
      .map((c) => {
        const p = profileMap.get(c.user_id)
        const last = lastByPeer.get(c.user_id)
        return {
          id: c.user_id,
          name: c.full_name || p?.full_name || 'Cliente',
          avatarUrl: p?.avatar_url,
          lastMessage: last?.content,
          lastAt: last?.at,
          unread: last?.unread || 0,
        }
      })
      .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''))
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3rem)] sm:h-[calc(100dvh-3.5rem)] bg-background">
      <ChatView
        currentUserId={user.id}
        role={role}
        otherUser={null}
        conversations={conversations}
      />
    </div>
  )
}
