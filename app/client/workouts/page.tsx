import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkoutSessions } from '@/lib/workouts'

export default async function ClientWorkoutsPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get client record
  const supabase = await createClient()
  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) {
    return (
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
          <div className="container flex items-center gap-3 py-3 sm:py-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-1">
              <Link href="/client/dashboard" aria-label="Volver al inicio">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold truncate sm:text-2xl">Mis Entrenamientos</h1>
          </div>
        </header>

        <main id="main-content" className="container py-8" tabIndex={-1}>
          <Card>
            <CardHeader>
              <CardTitle>Perfil incompleto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tu perfil de cliente aún no ha sido configurado. Contacta a tu entrenador.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const workoutSessions = await getWorkoutSessions(clientRecord.id)

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex items-center gap-3 py-3 sm:py-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-1">
            <Link href="/client/dashboard" aria-label="Volver al inicio">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold truncate sm:text-2xl">Mis Entrenamientos</h1>
        </div>
      </header>

      <main id="main-content" className="container py-8" tabIndex={-1}>
        {!workoutSessions || workoutSessions.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aún no tienes entrenamientos registrados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5" />
                  Historial de Entrenamientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workoutSessions.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {session.routine_days?.day_name || `Día ${session.routine_days?.day_number || '-'}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {session.started_at 
                              ? new Date(session.started_at).toLocaleDateString()
                              : new Date(session.created_at).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            session.status === 'completed'
                              ? 'bg-success/20 text-success hover:bg-success/20'
                              : session.status === 'in_progress'
                              ? 'bg-warning/20 text-warning-foreground hover:bg-warning/20'
                              : 'bg-muted text-muted-foreground hover:bg-muted'
                          }
                        >
                          {session.status === 'completed' ? 'Completado' :
                           session.status === 'in_progress' ? 'En progreso' : session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="size-4" />
                          <span>{session.exercises_completed || 0} ejercicios</span>
                        </div>
                        {session.duration_minutes && (
                          <span>{session.duration_minutes} min</span>
                        )}
                        {session.total_volume_kg && (
                          <span>{session.total_volume_kg} kg total</span>
                        )}
                      </div>
                      {session.feeling_note && (
                        <p className="mt-2 text-sm italic text-muted-foreground">
                          {session.feeling_note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
