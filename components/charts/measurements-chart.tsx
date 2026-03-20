'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type MeasurementRow = {
  recorded_at: string
  weight?: number | null
  waist_cm?: number | null
  body_fat_pct?: number | null
}

export function MeasurementsChart({ measurements }: { measurements: MeasurementRow[] }) {
  const [metric, setMetric] = useState<'weight' | 'waist' | 'fat'>('weight')

  const chartData = useMemo(() => {
    const sorted = [...(measurements || [])].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    )

    return sorted.map((m) => {
      const date = new Date(m.recorded_at).toLocaleDateString()
      const value =
        metric === 'weight'
          ? m.weight
          : metric === 'waist'
            ? m.waist_cm
            : m.body_fat_pct

      return {
        date,
        value: typeof value === 'number' ? value : null,
      }
    })
  }, [measurements, metric])

  const yLabel = metric === 'weight' ? 'kg' : metric === 'waist' ? 'cm' : '%'
  const title = metric === 'weight' ? 'Peso' : metric === 'waist' ? 'Cintura' : '% grasa corporal'

  return (
    <Tabs value={metric} onValueChange={(v) => setMetric(v as any)}>
      <TabsList className="w-fit flex-wrap">
        <TabsTrigger value="weight">Peso</TabsTrigger>
        <TabsTrigger value="waist">Cintura</TabsTrigger>
        <TabsTrigger value="fat">Grasa</TabsTrigger>
      </TabsList>

      <TabsContent value={metric} className="pt-4">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                  formatter={(value: any) => [`${value} ${yLabel}`, title]}
                  labelFormatter={(label: string) => label}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

