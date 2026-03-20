'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export function VolumeChart({
  sessions,
}: {
  sessions: { started_at: string; total_volume_kg: number | null }[]
}) {
  const chartData = useMemo(() => {
    return [...(sessions || [])]
      .filter((s) => typeof s.total_volume_kg === 'number')
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
      .map((s) => ({
        date: new Date(s.started_at).toLocaleDateString(),
        volumeKg: s.total_volume_kg as number,
      }))
  }, [sessions])

  return (
    <div className="space-y-3">
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
              formatter={(value: any) => [`${value} kg`, 'Volumen']}
              labelFormatter={(label: string) => label}
            />
            <Line type="monotone" dataKey="volumeKg" stroke="var(--color-primary)" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

