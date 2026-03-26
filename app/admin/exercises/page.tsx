import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminExerciseCatalog } from '@/components/admin/exercises/admin-exercise-catalog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Exercise } from '@/lib/types'

export default async function AdminExercisesPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/client/dashboard')

  const { data: rows, error } = await supabase.from('exercises').select('*').order('name')

  if (error) {
    console.error('admin exercises', error)
  }

  const exercises = (rows ?? []) as Exercise[]

  return (
    <div className="min-h-dvh bg-background">
      <AdminPageHeader
        sticky
        title="Catálogo de ejercicios"
        description="Estudia movimientos, revisa GIF y técnica, y añade nuevos a tu biblioteca."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/exercises/new">
              <Plus data-icon="inline-start" />
              Nuevo ejercicio
            </Link>
          </Button>
        }
      />

      <main className="container py-6 sm:py-8">
        <AdminExerciseCatalog exercises={exercises} />
      </main>
    </div>
  )
}
