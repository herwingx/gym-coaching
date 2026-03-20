'use client'

import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ExercisePoint = {
  achieved_at: string
  weight_kg: number
  reps?: number | null
}

export type ExerciseOption = {
  id: string
  name: string
}

export function ExerciseProgressChart({
  exercises,
  pointsByExerciseId,
  defaultExerciseId,
}: {
  exercises: ExerciseOption[]
  pointsByExerciseId: Record<string, ExercisePoint[]>
  defaultExerciseId?: string | null
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultExerciseId || exercises[0]?.id || null,
  )

  const chartData = useMemo(() => {
    if (!selectedId) return []
    const pts = pointsByExerciseId[selectedId] || []
    // Sort oldest->newest so the line looks correct
    return [...pts]
      .sort((a, b) => new Date(a.achieved_at).getTime() - new Date(b.achieved_at).getTime())
      .map((p) => ({
        date: new Date(p.achieved_at).toLocaleDateString(),
        weight_kg: p.weight_kg,
        reps: p.reps ?? null,
      }))
  }, [pointsByExerciseId, selectedId])

  const selectedName = exercises.find((e) => e.id === selectedId)?.name || '—'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">Peso máximo (PR) por ejercicio</div>
          <div className="font-semibold truncate">{selectedName}</div>
        </div>
        <Select
          value={selectedId ?? ''}
          onValueChange={(value) => setSelectedId(value || null)}
        >
          <SelectTrigger className="h-10 w-[180px]">
            <SelectValue placeholder="Seleccionar ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              formatter={(value: any) => [`${value} kg`, 'Peso']}
              labelFormatter={(label: string) => label}
            />
            <Line type="monotone" dataKey="weight_kg" stroke="var(--color-primary)" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

