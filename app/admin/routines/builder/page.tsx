import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { RoutineBuilderLazy } from './routine-builder-lazy'

export default async function BuilderPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/client/dashboard')

  return (
    <div className="min-h-dvh bg-background">
      <AdminPageHeader
        sticky
        title="Constructor de rutinas"
        description="Organiza la semana, arrastra ejercicios y guarda en un clic"
        backHref="/admin/routines"
        backLabel="Volver a rutinas"
      />

      <main className="container py-8">
        <RoutineBuilderLazy />
      </main>
    </div>
  )
}
