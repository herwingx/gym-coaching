import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ routineId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { routineId } = await params
  const supabase = await createClient()
  const { data: routine } = await supabase
    .from('routines')
    .select('name')
    .eq('id', routineId)
    .single()
  return {
    title: routine?.name ? `${routine.name} | GymCoach` : 'Rutina | GymCoach',
  }
}

export default async function RoutineDetailsPage({ params }: Props) {
  const user = await getAuthUser()
  const { routineId } = await params

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  const { data: routine } = await supabase
    .from('routines')
    .select(`
      *,
      routine_days (
        *,
        routine_exercises (
          *,
          exercises (*)
        )
      )
    `)
    .eq('id', routineId)
    .eq('coach_id', user.id)
    .single()

  if (!routine) {
    redirect('/admin/routines')
  }

  return (
    <div className="bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/routines">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{routine.name}</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6">
          {/* Routine Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Rutina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{routine.description || 'Sin descripción'}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dificultad</p>
                  <p className="font-medium capitalize">{routine.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-medium">{routine.duration_weeks} semanas</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{routine.is_template ? 'Template' : 'Personalizada'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grupos Musculares</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {routine.target_muscle_groups?.map((group: string) => (
                    <span key={group} className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded">
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Días de Entrenamiento</CardTitle>
              <Button asChild size="sm">
                <Link href={`/admin/routines/${routineId}/add-day`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Día
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!routine.routine_days || routine.routine_days.length === 0 ? (
                <p className="text-muted-foreground">
                  Esta rutina no tiene días configurados aún.
                </p>
              ) : (
                <div className="space-y-4">
                  {routine.routine_days.map((day: any) => (
                    <div key={day.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          Día {day.day_number} - {day.day_name}
                        </h4>
                        {day.is_rest_day && (
                          <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                            Día de descanso
                          </span>
                        )}
                      </div>
                      {day.focus_muscle_group && (
                        <p className="text-sm text-muted-foreground">
                          Enfoque: {day.focus_muscle_group}
                        </p>
                      )}
                      {!day.is_rest_day && day.routine_exercises && day.routine_exercises.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Ejercicios:</p>
                          <ul className="space-y-1">
                            {day.routine_exercises.map((ex: any) => (
                              <li key={ex.id} className="text-sm text-muted-foreground">
                                • {ex.exercises.name} - {ex.sets}x{ex.reps || 'variable'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
