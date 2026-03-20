import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RoutineBuilderClient } from './routine-builder-client'

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

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name')
    .order('name')

  return (
    <div className="bg-background min-h-dvh">
      <header className="border-b sticky top-0 bg-background z-10 safe-area-header-pt">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/routines">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Builder de Rutinas</h1>
            <p className="text-sm text-muted-foreground">
              Crea rutinas visuales con días y ejercicios
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        <RoutineBuilderClient exercises={exercises || []} />
      </main>
    </div>
  )
}
