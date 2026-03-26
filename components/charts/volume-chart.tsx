'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartAreaShadowFilter, useChartShadowFilterId } from '@/components/charts/chart-visual-utils'

const chartConfig = {
  volumeKg: {
    label: 'Volumen',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function VolumeChart({
  sessions,
}: {
  sessions: { started_at: string; total_volume_kg: number | null }[]
}) {
  const shadowFilterId = useChartShadowFilterId('vol')

  const chartData = useMemo(() => {
    return [...(sessions || [])]
      .map((s) => {
        const raw = s.total_volume_kg
        const n = typeof raw === 'number' ? raw : Number(raw)
        return {
          started_at: s.started_at,
          volumeKg: Number.isFinite(n) ? n : NaN,
        }
      })
      .filter((s) => s.started_at && Number.isFinite(s.volumeKg) && s.volumeKg >= 0)
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      .map((s) => ({
        date: new Date(s.started_at).toLocaleDateString(),
        volumeKg: s.volumeKg,
      }))
  }, [sessions])

  return (
    <div className="flex flex-col gap-3">
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
                  const n = typeof value === 'number' ? value : Number(value)
                  const safe = Number.isFinite(n) ? n : 0
                  return (
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      {safe.toLocaleString('es-ES')} kg
                    </span>
                  )
                }}
              />
            }
          />
          <Area
            name={chartConfig.volumeKg.label}
            dataKey="volumeKg"
            type="linear"
            fill="var(--color-volumeKg)"
            fillOpacity={0.4}
            stroke="var(--color-volumeKg)"
            strokeWidth={2}
            style={{ filter: `url(#${shadowFilterId})` }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
