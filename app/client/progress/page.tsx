import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Sparkles, TrendingUp } from 'lucide-react'
import {
  VolumeChartLazy,
  ExerciseProgressChartLazy,
} from '@/components/charts/progress-charts-lazy'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientIncompleteProfileCard,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'

export default async function ClientProgressPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const { data: clientRecord } = await supabase.from('clients').select('id').eq('user_id', user.id).single()

  if (!clientRecord) {
    return (
      <>
        <ClientStackPageHeader
          title="Progreso"
          subtitle="Completa tu perfil para ver volumen, PRs e insights."
        />
        <div className={CLIENT_DATA_PAGE_SHELL}>
          <ClientIncompleteProfileCard />
        </div>
      </>
    )
  }

  const clientId = clientRecord.id as string

  const { data: completedSessions } = await supabase
    .from('workout_sessions')
    .select('started_at,total_volume_kg,status')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('started_at', { ascending: true })
    .limit(60)

  const { data: prRows } = await supabase
    .from('personal_records')
    .select('achieved_at,weight_kg,reps,exercise_id,exercises(name,primary_muscle)')
    .eq('client_id', clientId)
    .order('achieved_at', { ascending: true })
    .limit(250)

  const exercises = Array.from(
    new Map(
      (prRows || []).map((r) => {
        const ex = r.exercises
        const meta = Array.isArray(ex) ? ex[0] : ex
        return [
          r.exercise_id,
          { id: r.exercise_id as string, name: meta?.name || 'Ejercicio' },
        ] as const
      }),
    ).values(),
  )

  const pointsByExerciseId: Record<
    string,
    { achieved_at: string; weight_kg: number; reps: number | null }[]
  > = {}
  for (const r of prRows || []) {
    const id = r.exercise_id
    if (!id) continue
    if (!pointsByExerciseId[id]) pointsByExerciseId[id] = []
    pointsByExerciseId[id].push({
      achieved_at: r.achieved_at as string,
      weight_kg: r.weight_kg as number,
      reps: r.reps ?? null,
    })
  }

  const now = new Date()
  const start30 = new Date()
  start30.setDate(now.getDate() - 29)
  start30.setHours(0, 0, 0, 0)

  let bestExerciseName: string | null = null
  let bestDeltaPct: number | null = null
  let bestFromWeight: number | null = null
  let bestToWeight: number | null = null

  for (const ex of exercises) {
    const pts = (pointsByExerciseId[ex.id] || [])
      .map((p) => ({ ...p, achieved_at: new Date(p.achieved_at).toISOString() }))
      .filter((p) => new Date(p.achieved_at).getTime() >= start30.getTime())
    if (pts.length < 2) continue

    const first = pts[0]
    const last = pts[pts.length - 1]
    const from = first.weight_kg
    const to = last.weight_kg
    if (!from || !to || from <= 0) continue

    const deltaPct = ((to - from) / from) * 100
    if (bestDeltaPct == null || deltaPct > bestDeltaPct) {
      bestDeltaPct = deltaPct
      bestExerciseName = ex.name
      bestFromWeight = from
      bestToWeight = to
    }
  }

  const sessionCountForChart = (completedSessions || []).length
  const prExerciseCount = exercises.length
  const progressSubtitle =
    sessionCountForChart === 0 && prExerciseCount === 0
      ? 'Sin datos aún · completa entrenos y registra PRs para ver tendencias.'
      : `${sessionCountForChart} ${sessionCountForChart === 1 ? 'sesión' : 'sesiones'} en volumen · ${prExerciseCount} ${prExerciseCount === 1 ? 'ejercicio con PR' : 'ejercicios con PR'}`

  const volumeInsights = (() => {
    const volumes = (completedSessions || [])
      .filter((s) => typeof s.total_volume_kg === 'number')
      .map((s) => s.total_volume_kg as number)

    if (volumes.length < 6) return null
    const last3 = volumes.slice(-3)
    const prev3 = volumes.slice(-6, -3)
    const avgLast = last3.reduce((a, b) => a + b, 0) / 3
    const avgPrev = prev3.reduce((a, b) => a + b, 0) / 3

    if (avgPrev <= 0) return null
    const diffPct = ((avgLast - avgPrev) / avgPrev) * 100
    if (diffPct > 5) return 'progress'
    if (diffPct < -5) return 'down'
    return 'flat'
  })()

  return (
    <>
      <ClientStackPageHeader title="Progreso" subtitle={progressSubtitle} />

      <div className={CLIENT_DATA_PAGE_SHELL}>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <TrendingUp className="size-4 text-primary" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Volumen</CardTitle>
                <CardDescription>Kilos totales por sesión completada</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VolumeChartLazy
              sessions={(completedSessions || []).map((s) => ({
                started_at: s.started_at,
                total_volume_kg: s.total_volume_kg,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5 lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="size-4 text-primary" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Progreso por ejercicio</CardTitle>
                <CardDescription>Tendencia según tus PRs registrados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ExerciseProgressChartLazy
              exercises={exercises}
              pointsByExerciseId={pointsByExerciseId}
              defaultExerciseId={exercises[0]?.id}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="size-4 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Insights</CardTitle>
              <CardDescription>Resumen automático con lo que tus datos sugieren hoy</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {bestExerciseName && bestDeltaPct != null ? (
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-5">
              <p className="font-semibold leading-snug">
                {bestExerciseName} subió {bestDeltaPct >= 0 ? '+' : ''}
                <span className="tabular-nums">{bestDeltaPct.toFixed(1)}</span>% en los últimos 30 días
              </p>
              <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                De {bestFromWeight?.toFixed(1)} kg a {bestToWeight?.toFixed(1)} kg
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-6 text-center sm:text-left">
              <p className="text-sm text-muted-foreground text-pretty">
                Aún no hay suficientes PRs recientes para generar insights. Sigue entrenando y registrando tus
                sesiones.
              </p>
            </div>
          )}

          {volumeInsights ? (
            <div className="rounded-xl border border-border/60 bg-muted/15 p-4 sm:p-5">
              <p className="font-semibold leading-snug">
                {volumeInsights === 'progress'
                  ? 'Tu volumen está mejorando'
                  : volumeInsights === 'down'
                    ? 'Tu volumen está bajando'
                    : 'Tu volumen está estable'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Comparación del promedio de los últimos 3 entrenos vs los 3 anteriores.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-6 text-center sm:text-left">
              <p className="text-sm text-muted-foreground text-pretty">
                Registra más entrenamientos completados para ver tendencia de volumen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  )
}
