'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartAreaShadowFilter, useChartShadowFilterId } from '@/components/charts/chart-visual-utils'

export type ExercisePoint = {
  achieved_at: string
  weight_kg: number
  reps?: number | null
}

export type ExerciseOption = {
  id: string
  name: string
}

const chartConfig = {
  weight_kg: {
    label: 'Peso',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function ExerciseProgressChart({
  exercises,
  pointsByExerciseId,
  defaultExerciseId,
}: {
  exercises: ExerciseOption[]
  pointsByExerciseId: Record<string, ExercisePoint[]>
  defaultExerciseId?: string | null
}) {
  const shadowFilterId = useChartShadowFilterId('ex')
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultExerciseId || exercises[0]?.id || null,
  )

  const chartData = useMemo(() => {
    if (!selectedId) return []
    const pts = pointsByExerciseId[selectedId] || []
    return [...pts]
      .sort((a, b) => new Date(a.achieved_at).getTime() - new Date(b.achieved_at).getTime())
      .map((p) => ({
        // Use full ISO timestamp as X key so multiple sessions in the same day don't collapse visually.
        date: p.achieved_at,
        weight_kg: p.weight_kg,
        reps: p.reps ?? null,
      }))
  }, [pointsByExerciseId, selectedId])

  const selectedName = exercises.find((e) => e.id === selectedId)?.name || '—'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">Mejor carga por entreno (kg)</div>
          <div className="truncate font-semibold">{selectedName}</div>
        </div>
        <Select
          value={selectedId ?? ''}
          onValueChange={(value) => setSelectedId(value || null)}
        >
          <SelectTrigger className="h-10 w-[min(100%,180px)]">
            <SelectValue placeholder="Seleccionar ejercicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {exercises.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
            tickFormatter={(value) => {
              const d = new Date(value as string)
              return d.toLocaleDateString()
            }}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(value) => {
                  const d = new Date(value as string)
                  return d.toLocaleDateString()
                }}
                formatter={(value, _name, _item, _index, payload) => {
                  const n = typeof value === 'number' ? value : Number(value)
                  const safe = Number.isFinite(n) ? n : 0
                  const reps = (payload as { reps?: number | null } | undefined)?.reps
                  const repsText =
                    reps != null && reps > 0 ? ` · ${reps} rep.` : ''
                  return (
                    <span className="text-foreground font-mono font-medium tabular-nums">
                      {safe.toFixed(1)} kg{repsText}
                    </span>
                  )
                }}
              />
            }
          />
          <Area
            name={chartConfig.weight_kg.label}
            dataKey="weight_kg"
            type="linear"
            fill="var(--color-weight_kg)"
            fillOpacity={0.4}
            stroke="var(--color-weight_kg)"
            strokeWidth={2}
            style={{ filter: `url(#${shadowFilterId})` }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
