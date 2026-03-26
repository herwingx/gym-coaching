import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getClientStats, getWorkoutSessionsByDateRange } from '@/lib/workouts'
import { sessionInstantLabel } from '@/lib/format-workout-session'
import { CalendarDays, ChevronRight, Clock, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientIncompleteProfileCard,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'
import { WorkoutsHistoryDateRangePicker } from '@/components/client/workouts-history-date-range'

type SearchParams = { from?: string; to?: string }

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
  
  // Rango por defecto: últimos 7 días
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  const fromIso = sp.from || sevenDaysAgo.toISOString().split('T')[0]
  const toIso = sp.to || today.toISOString().split('T')[0]

  const [workoutSessions, stats] = await Promise.all([
    getWorkoutSessionsByDateRange(clientRecord.id, fromIso, toIso),
    getClientStats(clientRecord.id),
  ])

  const rangeSessionCount = workoutSessions?.length ?? 0
  const totalCompleted = stats.totalSessions ?? 0

  const historySubtitle =
    totalCompleted === 0
      ? 'Sin sesiones aún · empieza un entreno desde Mis rutinas.'
      : rangeSessionCount === 0
        ? `Ninguna sesión en este rango${totalCompleted > 0 ? ` · ${totalCompleted} en total histórico` : ''}.`
        : `${rangeSessionCount} ${rangeSessionCount === 1 ? 'sesión' : 'sesiones'} encontradas${totalCompleted > rangeSessionCount ? ` · ${totalCompleted} en total histórico` : ''}.`

  const historyAside = (
    <aside className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
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
                <span className="tabular-nums font-semibold text-foreground">{rangeSessionCount}</span>{' '}
                {rangeSessionCount === 1 ? 'sesión en el rango' : 'sesiones en el rango'}
                {totalCompleted > rangeSessionCount ? (
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
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="size-4 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Sesiones</CardTitle>
                    <CardDescription>Cada entreno que completes aparecerá aquí</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-8 text-center sm:px-6">
                  <p className="text-sm font-medium text-foreground">Aún no tienes entrenamientos registrados</p>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">
                    Cuando completes un entreno desde <span className="font-medium text-foreground">Mis rutinas</span>, podrás
                    revisarlo aquí filtrado por fecha.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="size-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg">Tus Sesiones</CardTitle>
                    <CardDescription className="text-pretty truncate">
                      Historial detallado por fechas
                    </CardDescription>
                  </div>
                </div>
                
                <div className="shrink-0 w-full sm:w-auto">
                  <WorkoutsHistoryDateRangePicker 
                    defaultFrom={sevenDaysAgo} 
                    defaultTo={today} 
                  />
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col gap-4">
                {!workoutSessions || workoutSessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-10 text-center sm:px-6">
                    <p className="text-sm font-medium text-foreground">Nada que mostrar en estas fechas</p>
                    <p className="mt-2 text-sm text-muted-foreground text-pretty max-w-sm mx-auto">
                      Intenta seleccionar un rango de fechas diferente usando el calendario de arriba.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                  {workoutSessions.map((session) => {
                    const rd = session.routine_days
                    const dayMeta = Array.isArray(rd) ? rd[0] : rd
                    const when = sessionInstantLabel(session.started_at ?? session.created_at)
                    const planLabel =
                      dayMeta?.day_name?.trim() ||
                      (dayMeta?.day_number != null ? `Día ${dayMeta.day_number}` : null)

                    return (
                      <article
                        key={session.id}
                        className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm transition-all hover:shadow-md hover:border-border"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="min-w-0 flex flex-col gap-1 text-center sm:text-left">
                            <h2 className="text-base font-semibold text-foreground leading-snug tracking-tight">
                              {when.dateLine}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                              {when.timeLine ? (
                                <Badge variant="secondary" className="font-mono text-[11px] font-medium bg-muted/50 text-muted-foreground">
                                  {when.timeLine}
                                </Badge>
                              ) : null}
                              {planLabel ? (
                                <span className="text-sm text-muted-foreground">
                                  • Plan: <span className="font-medium text-foreground/80">{planLabel}</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                          
                          <Badge
                            variant="secondary"
                            className={cn(
                              'mx-auto shrink-0 sm:mx-0 font-medium px-2.5 py-0.5',
                              session.status === 'completed' &&
                                'border border-success/20 bg-success/10 text-success',
                              session.status === 'in_progress' &&
                                'border border-warning/30 bg-warning/15 text-warning-foreground',
                            )}
                          >
                            {session.status === 'completed'
                              ? 'Completada'
                              : session.status === 'in_progress'
                                ? 'En progreso'
                                : session.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                              <Dumbbell className="size-3.5 text-primary" aria-hidden />
                            </div>
                            <span className="text-sm font-medium tabular-nums text-foreground/80">
                              {session.exercises_completed ?? 0} <span className="text-muted-foreground font-normal">ejercicios</span>
                            </span>
                          </div>
                          
                          {session.duration_minutes != null ? (
                            <div className="flex items-center gap-2">
                              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                                <Clock className="size-3.5 text-primary" aria-hidden />
                              </div>
                              <span className="text-sm font-medium tabular-nums text-foreground/80">
                                {session.duration_minutes} <span className="text-muted-foreground font-normal">min</span>
                              </span>
                            </div>
                          ) : null}
                          
                          {session.total_volume_kg != null && session.total_volume_kg > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-[10px]">
                                KG
                              </div>
                              <span className="text-sm font-medium tabular-nums text-foreground/80">
                                {session.total_volume_kg} <span className="text-muted-foreground font-normal">volumen</span>
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {session.feeling_note ? (
                          <div className="mt-1 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                            <p className="text-sm italic leading-relaxed text-muted-foreground">
                              "{session.feeling_note}"
                            </p>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                  </div>
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
