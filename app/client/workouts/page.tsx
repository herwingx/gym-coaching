import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getClientStats, getWorkoutSessionsForMonth } from '@/lib/workouts'
import { sessionInstantLabel } from '@/lib/format-workout-session'
import { clampMonthYear } from '@/lib/client-month-nav'
import { CalendarDays, ChevronRight, Clock, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientIncompleteProfileCard,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'
import { WorkoutsHistoryMonthToolbar } from '@/components/client/workouts-history-month-toolbar'

type SearchParams = { y?: string; m?: string }

export default async function ClientWorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
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

  const sp = await searchParams
  const now = new Date()
  const parsedY = sp.y != null ? Number(sp.y) : now.getFullYear()
  const parsedM = sp.m != null ? Number(sp.m) : now.getMonth() + 1
  const { year, monthIndex } = clampMonthYear(parsedY, parsedM)

  const monthCaption = new Date(year, monthIndex, 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })

  const [workoutSessions, stats] = await Promise.all([
    getWorkoutSessionsForMonth(clientRecord.id, year, monthIndex),
    getClientStats(clientRecord.id),
  ])

  const monthSessionCount = workoutSessions?.length ?? 0
  const totalCompleted = stats.totalSessions ?? 0

  const historySubtitle =
    totalCompleted === 0
      ? 'Sin sesiones aún · empieza un entreno desde Mis rutinas.'
      : monthSessionCount === 0
        ? `Nada en ${monthCaption}${totalCompleted > 0 ? ` · ${totalCompleted} en total` : ''} · cambia de mes arriba.`
        : `${monthSessionCount} ${monthSessionCount === 1 ? 'sesión' : 'sesiones'} en ${monthCaption}${totalCompleted > monthSessionCount ? ` · ${totalCompleted} en total` : ''} · tiempo, volumen y notas.`

  const historyAside = (
    <aside className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Dumbbell className="size-4 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Acciones</CardTitle>
              <CardDescription>
                {totalCompleted === 0
                  ? 'Empieza desde tu rutina asignada'
                  : 'Seguir entrenando o revisar el plan'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground text-pretty">
            {totalCompleted === 0 ? (
              <>
                <span className="tabular-nums font-semibold text-foreground">0</span> sesiones aún. Tu primer
                entreno aparecerá aquí al completarlo.
              </>
            ) : (
              <>
                <span className="tabular-nums font-semibold text-foreground">{monthSessionCount}</span>{' '}
                {monthSessionCount === 1 ? 'sesión este mes' : 'sesiones este mes'}
                {totalCompleted > monthSessionCount ? (
                  <>
                    {' '}
                    ·{' '}
                    <span className="tabular-nums font-semibold text-foreground">{totalCompleted}</span> en total
                  </>
                ) : null}
                .
              </>
            )}
          </p>
          <Button asChild className="min-h-11 w-full font-semibold">
            <Link href="/client/routines">
              Ir a mis rutinas
              <ChevronRight data-icon="inline-end" className="size-4 shrink-0" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 w-full font-medium">
            <Link href="/client/progress">Ver progreso y gráficos</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  )

  return (
    <>
      <ClientStackPageHeader title="Historial" subtitle={historySubtitle} />

      <div
        className={`${CLIENT_DATA_PAGE_SHELL} flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start`}
      >
        <section className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:col-span-8">
          {totalCompleted === 0 ? (
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
                    Cuando completes un entreno desde <span className="font-medium">Mis rutinas</span>, podrás
                    revisarlo por mes en el historial.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="flex flex-col gap-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <CalendarDays className="size-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg">Sesiones</CardTitle>
                    <CardDescription className="text-pretty">
                      Un mes a la vez · la fecha mostrada es la del entreno real
                    </CardDescription>
                  </div>
                </div>
                <WorkoutsHistoryMonthToolbar
                  year={year}
                  monthIndex={monthIndex}
                  monthCaption={monthCaption}
                />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {!workoutSessions || workoutSessions.length === 0 ? (
                  <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center sm:px-6">
                    <p className="text-sm font-medium text-foreground">Nada que mostrar en este mes</p>
                    <p className="mt-2 text-sm text-muted-foreground text-pretty">
                      Usa los botones de mes o el calendario para ver otras fechas.
                    </p>
                  </div>
                ) : (
                  workoutSessions.map((session) => {
                    const rd = session.routine_days
                    const dayMeta = Array.isArray(rd) ? rd[0] : rd
                    const when = sessionInstantLabel(session.started_at ?? session.created_at)
                    const planLabel =
                      dayMeta?.day_name?.trim() ||
                      (dayMeta?.day_number != null ? `Día ${dayMeta.day_number}` : null)

                    return (
                      <article
                        key={session.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 shadow-sm transition-colors sm:p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0 text-center sm:text-left">
                            <h2 className="text-base font-semibold leading-snug">{when.dateLine}</h2>
                            {when.timeLine ? (
                              <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{when.timeLine}</p>
                            ) : null}
                            {planLabel ? (
                              <p className="mt-1 text-sm text-muted-foreground">
                                Día en el plan: <span className="text-foreground/90">{planLabel}</span>
                              </p>
                            ) : null}
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
                  })
                )}
              </CardContent>
            </Card>
          )}
        </section>
        {historyAside}
      </div>
    </>
  )
}
