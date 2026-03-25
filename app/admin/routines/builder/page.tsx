import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Button variant="ghost" size="icon" asChild className="size-9 sm:size-10">
            <Link href="/admin/routines">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">Constructor de rutinas</h1>
            <p className="truncate text-sm text-muted-foreground">
              Organiza la semana, arrastra ejercicios y guarda en un clic
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <RoutineBuilderLazy exercises={exercises || []} />
      </main>
    </div>
  )
}
