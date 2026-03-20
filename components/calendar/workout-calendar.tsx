'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type DayInfo = {
  dateKey: string // YYYY-MM-DD
  inMonth: boolean
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function WorkoutCalendar({
  year,
  monthIndex,
  sessionsByDate,
}: {
  year: number
  monthIndex: number // 0-11
  sessionsByDate: Record<
    string,
    { count: number; totalVolumeKg: number; lastSessionAt?: string | null }
  >
}) {
  const [selected, setSelected] = useState<string>(() => {
    const now = new Date()
    if (now.getFullYear() !== year || now.getMonth() !== monthIndex) {
      return ''
    }
    return toDateKey(now)
  })

  const { days, label } = useMemo(() => {
    const first = new Date(year, monthIndex, 1)
    const firstDayOfWeek = first.getDay() // 0 Sun - 6 Sat

    // Make grid start Monday
    const mondayIndex = (firstDayOfWeek + 6) % 7
    const gridStart = new Date(year, monthIndex, 1 - mondayIndex)

    const gridDays: DayInfo[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + i)
      const dateKey = toDateKey(d)
      gridDays.push({
        dateKey,
        inMonth: d.getMonth() === monthIndex,
      })
    }

    const monthName = first.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    return { days: gridDays, label: monthName }
  }, [year, monthIndex])

  const selectedInfo = selected ? sessionsByDate[selected] : undefined

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calendario</CardTitle>
          <div className="text-sm text-muted-foreground">{label}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const info = sessionsByDate[day.dateKey]
              const hasSession = Boolean(info)
              const isSelected = selected && day.dateKey === selected

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => setSelected(day.dateKey)}
                  className={[
                    'relative rounded-lg border px-1 py-1 text-left',
                    day.inMonth ? 'bg-background' : 'bg-muted/30',
                    !day.inMonth ? 'opacity-60' : '',
                    isSelected ? 'border-primary/70 ring-1 ring-primary/30' : 'hover:border-primary/40',
                  ].join(' ')}
                >
                  <div className="text-xs font-medium">
                    {Number(day.dateKey.split('-')[2])}
                  </div>
                  {hasSession ? (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] text-muted-foreground">{info.count}</span>
                    </div>
                  ) : (
                    <div className="mt-1 h-1.5" />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <div className="text-sm font-semibold">
                  {new Date(selected).toLocaleDateString('es-ES')}
                </div>
                {selectedInfo ? (
                  <>
                    <Badge variant="secondary">{selectedInfo.count} sesiones</Badge>
                    <div className="text-sm text-muted-foreground">
                      Volumen total: {Math.round(selectedInfo.totalVolumeKg)} kg
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No hay entrenamientos registrados en este día.
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Selecciona un día del calendario.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

