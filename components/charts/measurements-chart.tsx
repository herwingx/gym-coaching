'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartAreaShadowFilter, useChartShadowFilterId } from '@/components/charts/chart-visual-utils'

type MeasurementRow = {
  recorded_at: string
  weight?: number | null
  waist_cm?: number | null
  body_fat_pct?: number | null
}

type Metric = 'weight' | 'waist' | 'fat'
type ViewMode = 'raw' | 'monthly'

const METRIC_COLORS: Record<Metric, string> = {
  weight: 'var(--chart-1)',
  waist: 'var(--chart-2)',
  fat: 'var(--chart-3)',
}

export function MeasurementsChart({ measurements }: { measurements: MeasurementRow[] }) {
  const [metric, setMetric] = useState<Metric>('weight')
  const [viewMode, setViewMode] = useState<ViewMode>('raw')
  const shadowFilterId = useChartShadowFilterId(`meas-${metric}`)

  const { chartData, chartConfig, title } = useMemo(() => {
    const sorted = [...(measurements || [])].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    )

    const t =
      metric === 'weight' ? 'Peso' : metric === 'waist' ? 'Cintura' : '% grasa corporal'

    const cfg = {
      value: {
        label: t,
        color: METRIC_COLORS[metric],
      },
    } satisfies ChartConfig

    const rawRows = sorted
      .map((m) => {
        const date = new Date(m.recorded_at).toLocaleDateString()
        const raw =
          metric === 'weight' ? m.weight : metric === 'waist' ? m.waist_cm : m.body_fat_pct
        const value = typeof raw === 'number' ? raw : null
        return { date, value }
      })
      .filter((r) => r.value != null && typeof r.value === 'number')

    const rows =
      viewMode === 'monthly'
        ? (() => {
            const monthMap = new Map<string, { sum: number; count: number; date: Date }>()
            for (const m of sorted) {
              const raw =
                metric === 'weight' ? m.weight : metric === 'waist' ? m.waist_cm : m.body_fat_pct
              const n = typeof raw === 'number' ? raw : null
              if (n == null || !Number.isFinite(n)) continue
              const d = new Date(m.recorded_at)
              if (Number.isNaN(d.getTime())) continue
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              const prev = monthMap.get(key)
              if (prev) {
                monthMap.set(key, { ...prev, sum: prev.sum + n, count: prev.count + 1 })
              } else {
                monthMap.set(key, { sum: n, count: 1, date: d })
              }
            }
            return Array.from(monthMap.values())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((row) => ({
                // Mes + año numérico (p. ej. "mar 2026"). Evita confundir con "día 26".
                date: row.date.toLocaleDateString('es', { month: 'short', year: 'numeric' }),
                value: row.sum / row.count,
              }))
          })()
        : rawRows

    return { chartData: rows, chartConfig: cfg, title: t }
  }, [measurements, metric, viewMode])

  return (
    <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
      <TabsList className="flex w-fit flex-wrap gap-1">
        <TabsTrigger value="weight">Peso</TabsTrigger>
        <TabsTrigger value="waist">Cintura</TabsTrigger>
        <TabsTrigger value="fat">Grasa</TabsTrigger>
      </TabsList>

      <TabsContent value={metric} className="pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">{title}</div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="flex w-fit flex-wrap gap-1">
                <TabsTrigger value="raw">Registro</TabsTrigger>
                <TabsTrigger value="monthly">Promedio mensual</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full min-h-72">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
            >
              <defs>
                <ChartAreaShadowFilter id={shadowFilterId} />
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => {
                      const u =
                        metric === 'weight' ? 'kg' : metric === 'waist' ? 'cm' : '%'
                      const n = typeof value === 'number' ? value : Number(value)
                      const safe = Number.isFinite(n) ? n : 0
                      return (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {safe.toFixed(1)} {u}
                        </span>
                      )
                    }}
                  />
                }
              />
              <Area
                name={title}
                type="linear"
                dataKey="value"
                fill="var(--color-value)"
                fillOpacity={0.4}
                stroke="var(--color-value)"
                strokeWidth={2}
                style={{ filter: `url(#${shadowFilterId})` }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
