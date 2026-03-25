'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, FileImage, History, Dumbbell, Ruler, Notebook, Plus, Target } from 'lucide-react'
import { getGoalLabel } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import type { Routine, WorkoutSession } from '@/lib/types'

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

type ProgressPhotoRow = {
  id: string
  photo_url: string | null
  view_type?: string | null
  taken_at?: string | null
}

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

export function ClientProfileHub({
  client,
  profile,
  routine,
  workoutSessions,
  bodyMeasurements,
  progressPhotos,
  clientId,
}: {
  client: ClientHubClient
  profile: ClientHubProfile
  routine: Routine | null
  workoutSessions: HubWorkoutSession[]
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
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-fit flex-wrap gap-2">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="routine">Rutina</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        {/* RESUMEN */}
        <TabsContent value="summary" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
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
                  <Dumbbell className="w-4 h-4" />
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
                  <History className="w-4 h-4" />
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
                <Avatar className="h-12 w-12 rounded-xl">
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
                    {client?.status ? (
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? 'Activo' : client.status === 'pending' ? 'Pendiente' : client.status}
                      </Badge>
                    ) : null}
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

        {/* Pestañas inactivas: Radix desmonta el contenido (excepto la activa), así las imágenes y RoutineDayCards no cargan hasta abrirlas. */}
        <TabsContent value="routine" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="h-4 w-4" />
                Rutina asignada
              </CardTitle>
              {clientId ? (
                <Button asChild size="sm" variant={routine ? 'outline' : 'default'}>
                  <Link href={`/admin/clients/${clientId}/assign-routine`}>
                    <Plus className="mr-1 h-4 w-4" />
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
                <History className="h-4 w-4" />
                Sesiones recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {(workoutSessions || []).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {formatDate(s.started_at)}{' '}
                        {s.routine_days?.day_name ? `(${s.routine_days.day_name})` : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Estado: {s.status} · Volumen: {s.total_volume_kg ?? 0}kg
                      </div>
                    </div>
                    <Badge variant={s.status === 'completed' ? 'secondary' : 'outline'}>{s.status}</Badge>
                  </div>
                ))}
                {(workoutSessions || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aún no hay historial</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progreso (volumen total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {(workoutSessions || []).slice(0, 10).map((s) => (
                  <div key={s.id} className="grid grid-cols-3 items-center gap-3">
                    <div className="text-sm text-muted-foreground">{formatDate(s.started_at)}</div>
                    <div className="text-sm font-medium">{s.total_volume_kg ?? 0}kg</div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min(100, Math.round(((s.total_volume_kg ?? 0) / 200) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(workoutSessions || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sin datos de progreso aún</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ruler className="h-4 w-4" />
                Medidas corporales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {(bodyMeasurements || []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{formatDate(m.recorded_at)}</div>
                      <div className="text-xs text-muted-foreground">
                        Peso: {m.weight ?? '-'}kg · Grasa: {m.body_fat_pct ?? '-'}%
                      </div>
                    </div>
                    <Badge variant="secondary">#{m.id.slice(0, 4)}</Badge>
                  </div>
                ))}
                {(bodyMeasurements || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sin medidas registradas</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileImage className="h-4 w-4" />
                Fotos de progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(progressPhotos || []).map((p) => (
                  <div key={p.id} className="overflow-hidden rounded-lg border">
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground">
                        {p.view_type || '-'} · {formatDate(p.taken_at)}
                      </div>
                    </div>
                    <div className="relative aspect-4/3 bg-muted">
                      {p.photo_url ? (
                        <Image
                          src={p.photo_url}
                          alt={`Foto ${p.view_type}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
                {(progressPhotos || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sin fotos</div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTAS */}
        <TabsContent value="notes" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Notebook className="w-4 h-4" />
                Notas del coach (privadas)
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                Se guardan en `clients.notes` para este desarrollo.
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Agrega observaciones, lesiones, preferencias..."
                className="min-h-32"
              />

              {saveError ? <div className="text-sm text-destructive">{saveError}</div> : null}

              <div className="flex items-center justify-end gap-2">
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
                  {isSaving ? 'Guardando...' : 'Guardar notas'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

