'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminClientStatusBadge } from '@/components/admin/admin-client-status-badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowUpRight,
  History,
  Dumbbell,
  Ruler,
  Notebook,
  Plus,
  Target,
  Camera,
  LayoutGrid,
  Diff,
} from 'lucide-react'
import { getGoalLabel } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import type { Routine, WorkoutSession } from '@/lib/types'
import type { SessionExerciseLogRow } from '@/lib/workouts'
import {
  formatBodyMeasurementDate,
  sessionInstantLabel,
  workoutStatusBadgeClass,
  workoutStatusLabelEs,
} from '@/lib/format-workout-session'

import { PhotoGallery } from '@/components/photos/photo-gallery'
import { PhotoCompare } from '@/components/photos/photo-compare'
import type { ProgressPhoto } from '@/components/photos/photo-card'

const RoutineDayCards = dynamic(
  () => import('@/components/routines/routine-day-cards'),
  {
    ssr: false,
    loading: () => <Skeleton className="min-h-40 w-full rounded-xl" />,
  },
)

export type HubWorkoutSession = WorkoutSession & {
  routine_days?: { day_name?: string | null; day_number?: number | null } | null
}

type BodyMeasurementRow = {
  id: string
  recorded_at: string
  weight?: number | null
  body_fat_pct?: number | null
}

// Actualizado para coincidir con el componente PhotoCard
export type ProgressPhotoRow = ProgressPhoto

export type ClientHubClient = {
  id: string
  full_name: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  status?: string | null
  goal?: string | null
  notes?: string | null
  last_session_at?: string | null
  user_id?: string | null
  onboarding_completed?: boolean | null
  experience_level?: string | null
  plan_name?: string | null
  days_until_expiry?: number | null
}

type ClientHubProfile = {
  role?: string | null
  streak_days?: number | null
  last_workout_at?: string | null
  xp_points?: number | null
  level?: number | null
  onboarding_completed?: boolean | null
} | null

function formatDate(iso?: string | null) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString()
}

function formatRelativeDays(fromIso?: string | null) {
  if (!fromIso) return '-'
  const from = new Date(fromIso)
  if (Number.isNaN(from.getTime())) return '-'
  const now = new Date()
  const diff = Math.floor((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'hoy'
  if (diff === 1) return 'ayer'
  return `hace ${diff} días`
}

function trendFromSessions(sessions: HubWorkoutSession[]) {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime(),
  )
  const last = sorted[0]
  const prev = sorted[1]
  const lastVol = typeof last?.total_volume_kg === 'number' ? last.total_volume_kg : null
  const prevVol = typeof prev?.total_volume_kg === 'number' ? prev.total_volume_kg : null
  if (lastVol == null || prevVol == null) return 'flat'
  if (lastVol > prevVol) return 'up'
  if (lastVol < prevVol) return 'down'
  return 'flat'
}

function exerciseGroupsFromLogs(logs: SessionExerciseLogRow[]) {
  const order: string[] = []
  const byName = new Map<string, SessionExerciseLogRow[]>()
  for (const log of logs) {
    if (!byName.has(log.exercise_name)) {
      order.push(log.exercise_name)
      byName.set(log.exercise_name, [])
    }
    byName.get(log.exercise_name)!.push(log)
  }
  return order.map((name) => ({ name, sets: byName.get(name)! }))
}

function formatSetLine(log: SessionExerciseLogRow) {
  const w = log.weight_kg != null ? `${log.weight_kg} kg` : '—'
  const r = log.reps != null ? `${log.reps} rep.` : '—'
  const bits = [
    log.is_pr ? 'PR' : null,
    log.is_warmup ? 'Calentamiento' : null,
  ].filter(Boolean)
  const tag = bits.length ? ` · ${bits.join(' · ')}` : ''
  return `Serie ${log.set_number}: ${w} × ${r}${tag}`
}

const PROGRESS_VIEWPORT = 12

export function ClientProfileHub({
  client,
  profile,
  routine,
  workoutSessions,
  sessionExerciseLogs,
  bodyMeasurements,
  progressPhotos,
  clientId,
}: {
  client: ClientHubClient
  profile: ClientHubProfile
  routine: Routine | null
  workoutSessions: HubWorkoutSession[]
  sessionExerciseLogs: SessionExerciseLogRow[]
  bodyMeasurements: BodyMeasurementRow[]
  progressPhotos: ProgressPhotoRow[]
  clientId?: string
}) {
  const [tab, setTab] = useState('summary')
  const [notesDraft, setNotesDraft] = useState<string>(client?.notes || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const lastSessionAt = workoutSessions?.[0]?.started_at || client?.last_session_at || null
  const streakDays = profile?.streak_days ?? null
  const trend = useMemo(() => trendFromSessions(workoutSessions || []), [workoutSessions])

  const logsBySessionId = useMemo(() => {
    const m = new Map<string, SessionExerciseLogRow[]>()
    for (const row of sessionExerciseLogs || []) {
      if (!m.has(row.workout_session_id)) m.set(row.workout_session_id, [])
      m.get(row.workout_session_id)!.push(row)
    }
    return m
  }, [sessionExerciseLogs])

  const progressRows = useMemo(() => {
    const list = [...(workoutSessions || [])].slice(0, PROGRESS_VIEWPORT)
    list.sort(
      (a, b) =>
        new Date(a.started_at ?? 0).getTime() - new Date(b.started_at ?? 0).getTime(),
    )
    const vols = list.map((s) => Math.max(0, s.total_volume_kg ?? 0))
    const maxVol = vols.length ? Math.max(...vols) : 0
    return { list, maxVol }
  }, [workoutSessions])

  const measurementRows = useMemo(() => {
    const list = [...(bodyMeasurements || [])]
    return list.map((m, i) => {
      const older = list[i + 1]
      let weightDelta: string | null = null
      if (
        older &&
        m.weight != null &&
        older.weight != null &&
        Math.abs(m.weight - older.weight) > 1e-6
      ) {
        const d = m.weight - older.weight
        const sign = d > 0 ? '+' : ''
        weightDelta = `${sign}${d.toFixed(1)} kg vs medición anterior`
      }
      return { ...m, weightDelta }
    })
  }, [bodyMeasurements])

  async function saveNotes() {
    try {
      setIsSaving(true)
      setSaveError(null)

      const supabase = createClient()
      const { error } = await supabase
        .from('clients')
        .update({ notes: notesDraft || null })
        .eq('id', client.id)

      if (error) throw error
      setIsSaving(false)
    } catch (e: unknown) {
      setIsSaving(false)
      setSaveError(e instanceof Error ? e.message : 'Error al guardar notas')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-md border-b sm:static sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none">
          <ScrollArea className="w-full whitespace-nowrap pb-1">
            <TabsList className="inline-flex w-auto bg-muted/50 p-1 h-12 rounded-2xl border border-border/40 shadow-sm">
              <TabsTrigger value="summary" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <Target className="size-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="routine" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <Dumbbell className="size-4" />
                Rutina
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <History className="size-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <ArrowUpRight className="size-4" />
                Progreso
              </TabsTrigger>
              <TabsTrigger value="measurements" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <Ruler className="size-4" />
                Medidas
              </TabsTrigger>
              <TabsTrigger value="photos" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <Camera className="size-4" />
                Fotos
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-xl px-4 py-2 data-[state=active]:shadow-md gap-2">
                <Notebook className="size-4" />
                Notas
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* RESUMEN */}
        <TabsContent value="summary" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="size-4" />
                  Última sesión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatRelativeDays(lastSessionAt)}</div>
                <div className="text-xs text-muted-foreground">Fecha: {formatDate(lastSessionAt)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="size-4" />
                  Racha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streakDays ?? '-'}</div>
                <div className="text-xs text-muted-foreground">días consecutivos</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="size-4" />
                  Tendencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trend === 'up' ? 'Subiendo' : trend === 'down' ? 'Bajando' : 'Estancado'}
                </div>
                <div className="text-xs text-muted-foreground">volumen total último vs anterior</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos del cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="size-12 rounded-xl">
                  {client?.avatar_url ? (
                    <AvatarImage
                      src={client.avatar_url}
                      alt={client.full_name ?? 'Cliente'}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback>{(client?.full_name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">{client?.full_name || '-'}</div>
                    {client?.status ? <AdminClientStatusBadge status={client.status} /> : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {client?.email ? `Email: ${client.email}` : 'Sin email'} · {client?.phone ? `Tel: ${client.phone}` : 'Sin teléfono'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {client?.plan_name ? `Plan: ${client.plan_name}` : 'Sin plan activo'} ·{' '}
                    {client?.days_until_expiry != null 
                      ? client.days_until_expiry > 0 
                        ? `Vence en ${client.days_until_expiry} días` 
                        : 'Membresía vencida'
                      : 'Sin fecha de vencimiento'}
                  </div>
                  {client?.goal && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Target className="size-3.5 text-primary" />
                      Objetivo: {getGoalLabel(client.goal)}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Onboarding: {(profile?.onboarding_completed || client?.onboarding_completed || (client?.user_id && client?.goal && client?.experience_level)) ? 'Completado' : 'Pendiente'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routine" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="size-4" />
                Rutina asignada
              </CardTitle>
              {clientId ? (
                <Button asChild size="sm" variant={routine ? 'outline' : 'default'}>
                  <Link href={`/admin/clients/${clientId}/assign-routine`}>
                    <Plus className="mr-1 size-4" />
                    {routine ? 'Cambiar rutina' : 'Asignar rutina'}
                  </Link>
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {routine ? (
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <div className="text-lg font-semibold">{routine.name}</div>
                    {routine.description ? (
                      <div className="text-sm text-muted-foreground">{routine.description}</div>
                    ) : null}
                    <div className="text-sm text-muted-foreground">
                      Duración: {routine.duration_weeks ? `${routine.duration_weeks} semanas` : '-'} · Días:{' '}
                      {routine.days_per_week || routine.routine_days?.length || '-'}
                    </div>
                  </div>
                  <RoutineDayCards
                    days={(routine.routine_days || []).slice(0, 7)}
                    compact
                    emptyMessage="Esta rutina aún no tiene días cargados."
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sin rutina asignada</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4" />
                Sesiones recientes
              </CardTitle>
              <CardDescription>
                Fecha y hora según el inicio real de la sesión. El bloque de rutina es la plantilla asignada a ese entreno, no el día del calendario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(workoutSessions || []).length === 0 ? (
                <Empty className="border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <History />
                    </EmptyMedia>
                    <EmptyTitle>Aún no hay sesiones</EmptyTitle>
                    <EmptyDescription>
                      Cuando el asesorado registre entrenos, aparecerán aquí con volumen y detalle de series.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Accordion type="multiple" className="flex flex-col gap-2">
                  {(workoutSessions || []).map((s) => {
                    const when = sessionInstantLabel(s.started_at ?? s.created_at)
                    const routineDay = s.routine_days?.day_name?.trim()
                    const logs = logsBySessionId.get(s.id) ?? []
                    const groups = exerciseGroupsFromLogs(logs)
                    const vol = s.total_volume_kg ?? 0
                    const volLabel =
                      vol > 0
                        ? `${vol} kg de volumen`
                        : 'Volumen en 0 — puede ser sesión sin cargas registradas'

                    return (
                      <AccordionItem
                        key={s.id}
                        value={s.id}
                        className="rounded-xl border border-border/80 border-b-0 bg-card/50 px-3 last:border-b-0 data-[state=open]:bg-card"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                          <div className="flex w-full flex-col gap-1 text-left sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium leading-snug">{when.dateLine}</div>
                              <div className="text-muted-foreground text-xs">
                                {when.timeLine ? `${when.timeLine} · ` : null}
                                {volLabel}
                                {typeof s.exercises_completed === 'number'
                                  ? ` · ${s.exercises_completed} ejercicios completados`
                                  : null}
                              </div>
                              {routineDay ? (
                                <div className="text-muted-foreground mt-0.5 text-xs">
                                  Bloque de rutina:{' '}
                                  <span className="text-foreground/90">{routineDay}</span>
                                </div>
                              ) : null}
                            </div>
                            <Badge
                              variant="outline"
                              className={`shrink-0 font-medium ${workoutStatusBadgeClass(s.status)}`}
                            >
                              {workoutStatusLabelEs(s.status)}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3 pt-0">
                          <Separator className="mb-3" />
                          {groups.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                              No hay series registradas en esta sesión. Si el entreno se completó desde otro flujo, revisa que los logs se hayan guardado correctamente.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <p className="text-muted-foreground text-xs">
                                Detalle opcional: despliega para revisar series sin ir al historial técnico.
                              </p>
                              {groups.map(({ name, sets }) => (
                                <div key={name} className="rounded-lg bg-muted/40 px-3 py-2">
                                  <div className="text-sm font-medium">{name}</div>
                                  <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground text-xs">
                                    {sets.map((log, idx) => (
                                      <li key={`${name}-${log.set_number}-${idx}`}>{formatSetLine(log)}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progreso (volumen total)</CardTitle>
              <CardDescription>
                Últimas {PROGRESS_VIEWPORT} sesiones en orden cronológico. La barra es proporcional al mayor volumen de esta lista (no a un valor fijo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {progressRows.list.length === 0 ? (
                <Empty className="border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Target />
                    </EmptyMedia>
                    <EmptyTitle>Sin datos de volumen</EmptyTitle>
                    <EmptyDescription>Cuando haya sesiones completadas, verás la evolución aquí.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-4" aria-label="Volumen por sesión">
                  {progressRows.list.map((s) => {
                    const vol = Math.max(0, s.total_volume_kg ?? 0)
                    const pct =
                      progressRows.maxVol > 0 ? Math.min(100, Math.round((vol / progressRows.maxVol) * 100)) : 0
                    const when = sessionInstantLabel(s.started_at ?? s.created_at)
                    const isEmptyVol = vol <= 0

                    return (
                      <div
                        key={s.id}
                        className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1.5fr)] sm:items-center sm:gap-4"
                      >
                        <div className="min-w-0">
                          <div className={`text-sm font-medium ${isEmptyVol ? 'text-muted-foreground' : ''}`}>
                            {when.dateLine}
                          </div>
                          {when.timeLine ? (
                            <div className="text-muted-foreground text-xs">{when.timeLine}</div>
                          ) : null}
                        </div>
                        <div
                          className={`tabular-nums text-sm font-semibold ${isEmptyVol ? 'text-muted-foreground' : ''}`}
                        >
                          {vol} kg
                        </div>
                        <div className="min-w-0 sm:pt-0">
                          <Progress
                            value={pct}
                            className={isEmptyVol ? 'opacity-40' : ''}
                            aria-label={`Volumen relativo ${pct} por ciento`}
                          />
                          {isEmptyVol ? (
                            <span className="text-muted-foreground mt-1 block text-xs">Sin volumen registrado</span>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ruler className="size-4" />
                Medidas corporales
              </CardTitle>
              <CardDescription>Más recientes primero. Comparación de peso respecto a la medición anterior en la lista.</CardDescription>
            </CardHeader>
            <CardContent>
              {(bodyMeasurements || []).length === 0 ? (
                <Empty className="border border-dashed bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Ruler />
                    </EmptyMedia>
                    <EmptyTitle>Sin medidas</EmptyTitle>
                    <EmptyDescription>El asesorado aún no registró mediciones corporales.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="flex flex-col gap-0 divide-y divide-border/70 rounded-xl border border-border/80">
                  {measurementRows.map((m) => (
                    <div key={m.id} className="flex flex-col gap-1 px-4 py-3 first:rounded-t-xl last:rounded-b-xl">
                      <div className="text-sm font-medium">{formatBodyMeasurementDate(m.recorded_at)}</div>
                      <div className="text-foreground/90 text-sm">
                        <span className="font-medium">Peso:</span> {m.weight ?? '—'} kg
                        <span className="text-muted-foreground mx-2">·</span>
                        <span className="font-medium">Grasa:</span> {m.body_fat_pct ?? '—'}%
                      </div>
                      {m.weightDelta ? (
                        <div className="text-muted-foreground text-xs">{m.weightDelta}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="flex flex-col gap-8 focus-visible:outline-none">
          <Tabs defaultValue="gallery" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold">Registro Visual</h3>
                <p className="text-sm text-muted-foreground">Monitorea el progreso físico del asesorado.</p>
              </div>
              <TabsList className="grid grid-cols-2 w-full sm:w-[300px] h-11 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="gallery" className="rounded-lg gap-2 text-xs">
                  <LayoutGrid className="size-3.5" />
                  Galería
                </TabsTrigger>
                <TabsTrigger value="compare" className="rounded-lg gap-2 text-xs">
                  <Diff className="size-3.5" />
                  Comparador
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="gallery" className="focus-visible:outline-none">
              {(progressPhotos || []).length === 0 ? (
                <Empty className="border-2 border-dashed bg-muted/20 rounded-3xl py-16">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Camera className="text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>Sin fotos de progreso</EmptyTitle>
                    <EmptyDescription>
                      El asesorado aún no ha cargado imágenes de su evolución. 
                      Puedes pedirle que suba fotos desde su perfil.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <PhotoGallery 
                  photos={progressPhotos as ProgressPhoto[]} 
                  showActions={false} // Admin can't delete for now, or we can enable if needed
                />
              )}
            </TabsContent>

            <TabsContent value="compare" className="focus-visible:outline-none">
               <PhotoCompare photos={progressPhotos as ProgressPhoto[]} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Notebook className="size-4" />
                Notas del coach
              </CardTitle>
              <CardDescription>Privadas: solo el equipo de asesoría las ve en esta ficha.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="coach-private-notes">Observaciones</FieldLabel>
                  <FieldDescription>Lesiones, preferencias, límites, estilo de entreno o acuerdos con el asesorado.</FieldDescription>
                  <FieldContent>
                    <Textarea
                      id="coach-private-notes"
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Escribe notas útiles para seguimiento..."
                      className="min-h-36 resize-y"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>

              {saveError ? <div className="text-destructive text-sm" role="alert">{saveError}</div> : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t bg-muted/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-xs">
                Los cambios se guardan al pulsar guardar. Descartar restaura el texto que había al cargar la página.
              </p>
              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setNotesDraft(client?.notes || '')
                    setSaveError(null)
                  }}
                  disabled={isSaving}
                >
                  Descartar
                </Button>
                <Button type="button" onClick={saveNotes} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner data-icon="inline-start" className="opacity-80" />
                      Guardando…
                    </>
                  ) : (
                    'Guardar notas'
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
