'use client'

import { useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MeasurementRow } from './measurements-types'

type Metric = 'weight' | 'waist' | 'fat'

const METRIC_META: Record<
  Metric,
  { label: string; unit: string; colorVar: string }
> = {
  weight: { label: 'Peso', unit: 'kg', colorVar: 'var(--chart-1)' },
  waist: { label: 'Cintura', unit: 'cm', colorVar: 'var(--chart-2)' },
  fat: { label: 'Grasa corporal', unit: '%', colorVar: 'var(--chart-3)' },
}

export function MeasurementsRadarChart({
  measurements,
}: {
  measurements: MeasurementRow[]
}) {
  const [metric, setMetric] = useState<Metric>('weight')

  const { chartData, chartConfig, title } = useMemo(() => {
    const meta = METRIC_META[metric]
    const sorted = [...(measurements || [])].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    )

    // Radar: usamos los últimos 6 registros para que se vea “premium” y no se vuelva ilegible.
    const last = sorted.slice(-6)

    const extract = (m: MeasurementRow) => {
      if (metric === 'weight') return m.weight
      if (metric === 'waist') return m.waist_cm
      return m.body_fat_pct
    }

    const rows = last
      .map((m, idx) => {
        const d = new Date(m.recorded_at)
        const dayMonth = d.toLocaleDateString('es', { day: '2-digit', month: 'short' })
        const rawLabel = dayMonth
        const n = extract(m)
        if (typeof n !== 'number' || !Number.isFinite(n)) return null

        // Si hay 2 registros el mismo día, mantenemos estabilidad con sufijo.
        const prevIso = last[idx - 1]?.recorded_at
        const label =
          idx > 0 && prevIso === m.recorded_at ? `${rawLabel}#${idx + 1}` : rawLabel

        return { label, value: n }
      })
      .filter((r): r is { label: string; value: number } => !!r)

    const cfg = {
      value: {
        label: meta.label,
        color: meta.colorVar,
      },
    } satisfies ChartConfig

    return {
      chartData: rows,
      chartConfig: cfg,
      title: `Radar de ${meta.label} (últimos ${rows.length} registros)`,
    }
  }, [measurements, metric])

  const meta = METRIC_META[metric]
  const pointCount = chartData.length

  return (
    <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
      <TabsList className="flex w-fit flex-wrap gap-1">
        <TabsTrigger value="weight">Peso</TabsTrigger>
        <TabsTrigger value="waist">Cintura</TabsTrigger>
        <TabsTrigger value="fat">Grasa</TabsTrigger>
      </TabsList>

      <TabsContent value={metric} className="pt-4">
        {pointCount === 0 ? (
          <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-6 text-sm text-muted-foreground">
            Aún no hay registros para generar el radar.
          </div>
        ) : pointCount < 3 ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-4 text-sm text-muted-foreground">
              Con {pointCount} registro{pointCount === 1 ? '' : 's'} el radar se vuelve una línea.
              Te muestro la evolución como gráfico simple.
            </div>

            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-72 w-full min-h-72"
            >
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 12, bottom: 0, left: 12 }}
              >
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => {
                        const n =
                          typeof value === 'number' ? value : Number(value)
                        const safe = Number.isFinite(n) ? n : 0
                        return `${safe.toFixed(1)} ${meta.unit}`
                      }}
                    />
                  }
                />

                <Line
                  name={meta.label}
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-muted-foreground">{title}</div>

            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-72 w-full min-h-72"
            >
              <RadarChart
                data={chartData}
                outerRadius="75%"
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      nameKey="value"
                      formatter={(value) => {
                        const n =
                          typeof value === 'number' ? value : Number(value)
                        const safe = Number.isFinite(n) ? n : 0
                        return `${safe.toFixed(1)} ${meta.unit}`
                      }}
                    />
                  }
                />
                <PolarAngleAxis dataKey="label" tickLine={false} axisLine={false} />
                <PolarGrid />
                <Radar
                  name={meta.label}
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="var(--color-value)"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ChartContainer>

            <div className="text-xs text-muted-foreground">
              Compará tus últimos registros en formato radar para detectar cambios rápido.
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

