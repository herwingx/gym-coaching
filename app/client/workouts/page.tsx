import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { getWorkoutSessions } from '@/lib/workouts'
import { CalendarDays, Clock, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientIncompleteProfileCard,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'

export default async function ClientWorkoutsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: clientRecord } = await supabase.from('clients').select('id').eq('user_id', user.id).single()

  if (!clientRecord) {
    return (
      <>
        <ClientStackPageHeader
          title="Historial"
          subtitle="Completa tu perfil para ver tus sesiones y volumen."
        />
        <div className={CLIENT_DATA_PAGE_SHELL}>
          <ClientIncompleteProfileCard />
        </div>
      </>
    )
  }

  const workoutSessions = await getWorkoutSessions(clientRecord.id, 80)
  const sessionCount = workoutSessions?.length ?? 0
  const historySubtitle =
    sessionCount === 0
      ? 'Sin sesiones aún · empieza un entreno desde Mis rutinas.'
      : `${sessionCount} ${sessionCount === 1 ? 'sesión registrada' : 'sesiones registradas'} · tiempo, volumen y notas.`

  return (
    <>
      <ClientStackPageHeader title="Historial" subtitle={historySubtitle} />

      <div className={CLIENT_DATA_PAGE_SHELL}>
      {!workoutSessions || workoutSessions.length === 0 ? (
        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <CalendarDays className="size-4 text-primary" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Sesiones</CardTitle>
                <CardDescription>Cada entreno que completes aparecerá aquí</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center sm:px-6">
              <p className="text-sm font-medium text-foreground">Aún no tienes entrenamientos registrados</p>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                Cuando completes un entreno desde <span className="font-medium">Mis rutinas</span>, aparecerá en
                esta lista con fecha, volumen y notas.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <CalendarDays className="size-4 text-primary" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Sesiones</CardTitle>
                <CardDescription>Lista ordenada por fecha</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {workoutSessions.map((session) => {
              const rd = session.routine_days
              const dayMeta = Array.isArray(rd) ? rd[0] : rd
              const dateSrc = session.started_at ?? session.created_at
              const dateLabel = new Date(dateSrc).toLocaleDateString('es', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })

              return (
                <article
                  key={session.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 shadow-sm transition-colors sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 text-center sm:text-left">
                      <h2 className="text-base font-semibold leading-snug">
                        {dayMeta?.day_name || `Día ${dayMeta?.day_number ?? '—'}`}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground tabular-nums">{dateLabel}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'mx-auto shrink-0 sm:mx-0',
                        session.status === 'completed' &&
                          'border border-success/30 bg-success/10 text-success',
                        session.status === 'in_progress' &&
                          'border border-warning/35 bg-warning/15 text-warning-foreground',
                      )}
                    >
                      {session.status === 'completed'
                        ? 'Completado'
                        : session.status === 'in_progress'
                          ? 'En progreso'
                          : session.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:justify-start">
                    <span className="inline-flex items-center gap-1.5">
                      <Dumbbell className="size-4 shrink-0 text-primary/80" aria-hidden />
                      <span className="tabular-nums">{session.exercises_completed ?? 0} ejercicios</span>
                    </span>
                    {session.duration_minutes != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4 shrink-0 text-primary/80" aria-hidden />
                        <span className="tabular-nums">{session.duration_minutes} min</span>
                      </span>
                    ) : null}
                    {session.total_volume_kg != null ? (
                      <span className="tabular-nums font-medium text-foreground">
                        {session.total_volume_kg} kg volumen
                      </span>
                    ) : null}
                  </div>

                  {session.feeling_note ? (
                    <p className="rounded-lg border border-border/50 bg-background/80 px-3 py-2 text-sm italic leading-relaxed text-muted-foreground">
                      {session.feeling_note}
                    </p>
                  ) : null}
                </article>
              )
            })}
          </CardContent>
        </Card>
      )}
      </div>
    </>
  )
}
