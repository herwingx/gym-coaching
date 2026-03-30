'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

const Area = dynamic(() => import('recharts').then((mod) => mod.Area as any), { ssr: false }) as typeof import('recharts').Area
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart as any), { ssr: false }) as typeof import('recharts').AreaChart
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid as any), { ssr: false }) as typeof import('recharts').CartesianGrid
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis as any), { ssr: false }) as typeof import('recharts').XAxis

import { useIsMobile } from '@/hooks/use-mobile'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { ChartAreaShadowFilter, useChartShadowFilterId } from '@/components/charts/chart-visual-utils'

export type ChartDataPoint = { date: string; sessions: number }

const chartConfig = {
  sessions: {
    label: 'Sesiones',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ClientWorkoutChart({ data }: { data: ChartDataPoint[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState('90d')
  const shadowFilterId = useChartShadowFilterId('client-sessions')

  React.useEffect(() => {
    if (isMobile) setTimeRange('7d')
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!data.length) return []
    const ref = data[data.length - 1]?.date
    if (!ref) return data
    const referenceDate = new Date(ref)
    let daysToSubtract = 90
    if (timeRange === '30d') daysToSubtract = 30
    else if (timeRange === '7d') daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return data.filter((item) => new Date(item.date) >= startDate)
  }, [data, timeRange])

  return (
    <Card className="@container/card overflow-hidden border-border/50 shadow-md ring-1 ring-primary/10">
      <CardHeader>
        <CardTitle>Mi progreso</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Sesiones y volumen por día
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Seleccionar período"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[min(280px,50vw)] w-full min-h-[220px]"
        >
          <AreaChart
            accessibilityLayer
            data={filteredData}
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
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  indicator="dot"
                  formatter={(value) => {
                    const n = typeof value === 'number' ? value : Number(value)
                    const safe = Number.isFinite(n) ? n : 0
                    const text =
                      safe === 1 ? '1 sesión' : `${safe} sesiones`
                    return (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {text}
                      </span>
                    )
                  }}
                />
              }
            />
            <Area
              name={chartConfig.sessions.label}
              dataKey="sessions"
              type="linear"
              fill="var(--color-sessions)"
              fillOpacity={0.4}
              stroke="var(--color-sessions)"
              strokeWidth={2}
              style={{ filter: `url(#${shadowFilterId})` }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
