'use client'

import dynamic from 'next/dynamic'

const Area = dynamic(() => import('recharts').then((mod) => mod.Area as any), { ssr: false }) as typeof import('recharts').Area
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart as any), { ssr: false }) as typeof import('recharts').AreaChart
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid as any), { ssr: false }) as typeof import('recharts').CartesianGrid
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis as any), { ssr: false }) as typeof import('recharts').XAxis
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis as any), { ssr: false }) as typeof import('recharts').YAxis

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartAreaShadowFilter, useChartShadowFilterId } from '@/components/charts/chart-visual-utils'

interface ProgressChartProps {
  data: { date: string; value: number }[]
  title: string
  dataKey?: string
  /** Token CSS (--chart-1 …) o variable de tema */
  color?: string
}

export function ProgressChart({
  data,
  title,
  dataKey = 'value',
  color = 'var(--chart-1)',
}: ProgressChartProps) {
  const seriesKey = dataKey === 'value' ? 'value' : dataKey
  const chartConfig = {
    [seriesKey]: {
      label: title,
      color,
    },
  } satisfies ChartConfig

  const shadowFilterId = useChartShadowFilterId(`prog-${seriesKey}`)

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sin datos disponibles
          </div>
        </CardContent>
      </Card>
    )
  }

  const colorVar = `--color-${seriesKey}` as const

  return (
    <Card className="overflow-hidden border-border/60 shadow-md ring-1 ring-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full min-h-[200px]">
          <AreaChart
            accessibilityLayer
            data={data}
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
              minTickGap={20}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} />
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
                        {safe.toLocaleString('es-ES')}
                      </span>
                    )
                  }}
                />
              }
            />
            <Area
              name={title}
              type="linear"
              dataKey={seriesKey}
              fill={`var(${colorVar})`}
              fillOpacity={0.4}
              stroke={`var(${colorVar})`}
              strokeWidth={2}
              style={{ filter: `url(#${shadowFilterId})` }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
