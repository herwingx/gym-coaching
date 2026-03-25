import { getAuthUser } from '@/lib/auth-utils'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RoutineBuilderClient } from '../../builder/routine-builder-client'

type RoutineExerciseRow = {
  id: string
  exercise_id: string
  order_index: number
  sets: number | null
  reps: string | number | null
  rest_seconds: number | null
}

type RoutineDayRow = {
  id: string
  day_number: number
  day_name: string | null
  is_rest_day: boolean | null
  routine_exercises: RoutineExerciseRow[] | null
}

interface Props {
  params: Promise<{ routineId: string }>
}

export default async function EditRoutinePage({ params }: Props) {
  const user = await getAuthUser()
  const { routineId } = await params

  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/client/dashboard')

  const admin = createAdminClient()
  const { data: routine } = await admin
    .from('routines')
    .select(
      `
      *,
      routine_days (
        id,
        day_number,
        day_name,
        is_rest_day,
        routine_exercises (
          id,
          exercise_id,
          order_index,
          sets,
          reps,
          rest_seconds
        )
      )
    `
    )
    .eq('id', routineId)
    .single()

  if (!routine) notFound()

  if (routine.coach_id && routine.coach_id !== user.id) {
    redirect('/admin/routines')
  }

  const { data: exercises } = await admin
    .from('exercises')
    .select('*')
    .order('name')

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const existingDays: RoutineDayRow[] = ((routine.routine_days ?? []) as RoutineDayRow[])
    .slice()
    .sort((a, b) => a.day_number - b.day_number)

  const builderInitialData = {
    name: routine.name,
    description: routine.description || '',
    durationWeeks: routine.duration_weeks || 4,
    days: dayNames.map((name, i) => {
      const rd = existingDays.find((d) => d.day_number === i + 1)
      if (rd) {
        return {
          id: rd.id,
          dayNumber: rd.day_number,
          name: rd.day_name ?? name,
          isRestDay: rd.is_rest_day ?? false,
          exercises: (rd.routine_exercises ?? [])
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .map((re) => ({
              id: re.id,
              exerciseId: re.exercise_id,
              sets: re.sets ?? 3,
              reps: re.reps != null ? String(re.reps) : '',
              restSeconds: re.rest_seconds ?? 60,
            })),
        }
      }
      return {
        id: String(i + 1),
        dayNumber: i + 1,
        name,
        isRestDay: [5, 6].includes(i),
        exercises: [] as { id: string; exerciseId: string; sets: number; reps: string; restSeconds: number }[],
      }
    }),
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Button variant="ghost" size="icon" asChild className="size-9 sm:size-10">
            <Link href={`/admin/routines/${routineId}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate tracking-tight sm:text-2xl">
              Editar rutina
            </h1>
            <p className="text-sm text-muted-foreground truncate">{routine.name}</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <RoutineBuilderClient
          exercises={exercises || []}
          routineId={routineId}
          initialData={builderInitialData}
        />
      </main>
    </div>
  )
}
