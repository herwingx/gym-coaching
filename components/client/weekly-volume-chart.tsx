'use client'

import dynamic from 'next/dynamic'

const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar as any), { ssr: false }) as typeof import('recharts').Bar
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart as any), { ssr: false }) as typeof import('recharts').BarChart
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

interface WeeklyVolumeChartProps {
  data: { day: string; volume: number }[]
}

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const chartConfig = {
  volume: {
    label: 'Volumen',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
  const filledData = DAYS.map((day) => {
    const existing = data.find((d) => d.day === day)
    return existing || { day, volume: 0 }
  })

  return (
    <Card className="overflow-hidden border-border/60 shadow-md ring-1 ring-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Volumen semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full min-h-[200px]">
          <BarChart
            accessibilityLayer
            data={filledData}
            margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={52}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)} t`}
            />
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
            <Bar
              name={chartConfig.volume.label}
              dataKey="volume"
              fill="var(--color-volume)"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
