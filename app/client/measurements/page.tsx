import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MeasurementsChart } from '@/components/charts/measurements-chart'
import { AddMeasurementForm } from './add-measurement-form'

export default async function ClientMeasurementsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) redirect('/client/dashboard')

  const measurementsRes = await supabase
    .from('body_measurements')
    .select('id, recorded_at, weight, waist_cm, body_fat_pct')
    .eq('client_id', clientRecord.id)
    .order('recorded_at', { ascending: true })
    .limit(120)

  const measurements = measurementsRes.data || []
  const latest = measurements.length ? (measurements[measurements.length - 1] as any) : null

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
            <h1 className="text-2xl font-bold">Medidas</h1>
            <p className="text-sm text-muted-foreground">Peso, cintura y grasa corporal</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container py-8 space-y-6" tabIndex={-1}>
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Resumen
            </CardTitle>
            <AddMeasurementForm />
          </CardHeader>
          <CardContent>
            {!latest ? (
              <p className="text-muted-foreground">Aún no tienes medidas registradas. Usa el botón arriba para registrar tu primera medida.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Peso</p>
                  <p className="text-2xl font-bold">{latest.weight ?? '-' } kg</p>
                  <p className="text-xs text-muted-foreground">{new Date(latest.recorded_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cintura</p>
                  <p className="text-2xl font-bold">{latest.waist_cm ?? '-' } cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">% Grasa</p>
                  <p className="text-2xl font-bold">{latest.body_fat_pct ?? '-' }%</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evolución</CardTitle>
            <div className="text-xs text-muted-foreground">Selecciona la métrica para ver la tendencia</div>
          </CardHeader>
          <CardContent>
            <MeasurementsChart
              measurements={measurements.map((m: any) => ({
                recorded_at: m.recorded_at,
                weight: m.weight,
                waist_cm: m.waist_cm,
                body_fat_pct: m.body_fat_pct,
              }))}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

