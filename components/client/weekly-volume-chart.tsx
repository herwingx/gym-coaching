"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface WeeklyVolumeChartProps {
  data: { day: string; volume: number }[]
}

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

export function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
  const chartConfig = {
    volume: {
      label: "Volumen (kg)",
      color: "var(--primary)",
    },
  }

  // Fill missing days with 0
  const filledData = DAYS.map((day, index) => {
    const existing = data.find(d => d.day === day)
    return existing || { day, volume: 0 }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Volumen Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filledData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={50}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}t`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volumen']}
              />
              <Bar
                dataKey="volume"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
