import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientManagementContent, type ClientManagementCard } from './client-management-content'

export default async function AdminClientsPage() {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user || role !== 'admin') redirect('/auth/login')

  const supabase = await createClient()

  // 1. Fetch clients with basic info
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select(`
      id, 
      user_id, 
      full_name, 
      avatar_url, 
      status, 
      email, 
      phone, 
      goal, 
      experience_level, 
      membership_end, 
      last_session_at, 
      created_at,
      current_plan_id
    `)
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  if (clientsError) throw clientsError
  const clientsList = clientsData || []

  // 2. Fetch plans to resolve names
  const planIds = [...new Set(clientsList.map((c) => c.current_plan_id).filter(Boolean))]
  const plansById = new Map<string, string>()
  if (planIds.length > 0) {
    const { data: plans } = await supabase
      .from('membership_plans')
      .select('id, name')
      .in('id', planIds)
    for (const p of plans || []) plansById.set(p.id, p.name)
  }

  // 3. Map to Management Cards
  const clients: ClientManagementCard[] = clientsList.map((c) => ({
    id: c.id,
    userId: c.user_id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone,
    avatarUrl: c.avatar_url,
    status: c.status,
    membershipEnd: c.membership_end,
    goal: c.goal,
    experienceLevel: c.experience_level,
    lastSessionAt: c.last_session_at,
    planName: c.current_plan_id ? plansById.get(c.current_plan_id) ?? null : null,
    createdAt: c.created_at,
  }))

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Asesorados</h1>
            <p className="text-muted-foreground mt-1">
              {clients.length} asesorado{clients.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/admin/clients/new">
              <Plus className="size-4 mr-2" />
              Nuevo asesorado
            </Link>
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <ClientManagementContent clients={clients} />
      </main>
    </div>
  )
}
