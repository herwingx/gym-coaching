import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoutines } from '@/lib/routines'
import { AssignRoutineForm } from './assign-routine-form'

interface Props {
  params: Promise<{ clientId: string }>
}

export default async function AssignRoutinePage({ params }: Props) {
  const user = await getAuthUser()
  const role = await getUserRole()
  const { clientId } = await params

  if (!user) redirect('/auth/login')
  if (role !== 'admin') redirect('/auth/login')

  const supabase = await createClient()
  const { data: client } = await supabase
    .from('clients')
    .select('full_name')
    .eq('id', clientId)
    .eq('coach_id', user.id)
    .single()

  if (!client) redirect('/admin/clients')

  const routines = await getRoutines()

  return (
    <AssignRoutineForm
      clientId={clientId}
      clientName={client.full_name}
      routines={routines}
    />
  )
}
