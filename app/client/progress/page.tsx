import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react'
import { ExerciseProgressChart } from '@/components/charts/exercise-progress-chart'
import { VolumeChart } from '@/components/charts/volume-chart'

export default async function ClientProgressPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) {
    return (
      <div className="min-h-dvh bg-background">
        <header className="border-b">
          <div className="container flex items-center gap-4 py-4">
            <Button variant="ghost" size="icon" asChild aria-label="Volver al dashboard">
              <Link href="/client/dashboard">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Mi Progreso</h1>
          </div>
        </header>
        <main id="main-content" className="container py-8" tabIndex={-1}>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Tu perfil aún no está configurado.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const clientId = clientRecord.id as string

  // Volume over time
  const { data: completedSessions } = await supabase
    .from('workout_sessions')
    .select('started_at,total_volume_kg,status')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('started_at', { ascending: true })
    .limit(60)

  // PRs per exercise (used to build the exercise progress chart)
  const { data: prRows } = await supabase
    .from('personal_records')
    .select('achieved_at,weight_kg,reps,exercise_id,exercises(name,primary_muscle)')
    .eq('client_id', clientId)
    .order('achieved_at', { ascending: true })
    .limit(250)

  const exercises = Array.from(
    new Map(
      (prRows || []).map((r: any) => [
        r.exercise_id,
        { id: r.exercise_id, name: r.exercises?.name || 'Ejercicio' },
      ]),
    ).values(),
  )

  const pointsByExerciseId: Record<string, any[]> = {}
  for (const r of prRows || []) {
    const id = r.exercise_id
    if (!id) continue
    if (!pointsByExerciseId[id]) pointsByExerciseId[id] = []
    pointsByExerciseId[id].push({
      achieved_at: r.achieved_at,
      weight_kg: r.weight_kg,
      reps: r.reps ?? null,
    })
  }

  // Insights
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

  const volumeInsights = (() => {
    const volumes = (completedSessions || [])
      .filter((s: any) => typeof s.total_volume_kg === 'number')
      .map((s: any) => s.total_volume_kg as number)

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
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild aria-label="Volver al dashboard">
            <Link href="/client/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Mi Progreso</h1>
            <p className="text-sm text-muted-foreground">Gráficas de peso, PR y volumen</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container py-8 space-y-6" tabIndex={-1}>
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Volumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VolumeChart
                sessions={(completedSessions || []).map((s: any) => ({
                  started_at: s.started_at,
                  total_volume_kg: s.total_volume_kg,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Progreso por Ejercicio
              </CardTitle>
              <div className="text-xs text-muted-foreground">Usa tus PRs para ver tendencia</div>
            </CardHeader>
            <CardContent>
              <ExerciseProgressChart
                exercises={exercises}
                pointsByExerciseId={pointsByExerciseId}
                defaultExerciseId={exercises[0]?.id}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Insights
            </CardTitle>
            <div className="text-xs text-muted-foreground">Recomendaciones automáticas basadas en tus últimos datos</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestExerciseName && bestDeltaPct != null ? (
              <div className="rounded-lg border p-4">
                <div className="font-semibold">
                  {bestExerciseName} subió {bestDeltaPct >= 0 ? '+' : ''}
                  {bestDeltaPct.toFixed(1)}% en los últimos 30 días
                </div>
                <div className="text-sm text-muted-foreground">
                  De {bestFromWeight?.toFixed(1)}kg a {bestToWeight?.toFixed(1)}kg
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Aún no hay suficientes PRs recientes para generar insights. Sigue entrenando y registrando tus sesiones.
              </div>
            )}

            {volumeInsights ? (
              <div className="rounded-lg border p-4">
                <div className="font-semibold">
                  {volumeInsights === 'progress'
                    ? 'Tu volumen está mejorando'
                    : volumeInsights === 'down'
                      ? 'Tu volumen está bajando'
                      : 'Tu volumen está estable'}
                </div>
                <div className="text-sm text-muted-foreground">Comparación promedio de últimos 3 vs 3 entrenamientos anteriores</div>
              </div>
            ) : (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Registra más entrenamientos para ver tendencia de volumen.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
