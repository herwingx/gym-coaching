'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDateKeyLocal } from '@/lib/calendar-date'
import { cn } from '@/lib/utils'

type DayInfo = {
  dateKey: string // YYYY-MM-DD
  inMonth: boolean
}

export type MonthWorkoutStats = {
  totalVolumeKg: number
  sessionCount: number
  uniqueDays: number
  avgVolumePerSession: number
  maxDayVolumeKg: number
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function initialSelectedForMonth(
  year: number,
  monthIndex: number,
  sessionsByDate: Record<string, unknown>,
) {
  const now = new Date()
  if (now.getFullYear() === year && now.getMonth() === monthIndex) {
    return toDateKey(now)
  }
  const prefix = `${year}-${pad2(monthIndex + 1)}-`
  return (
    Object.keys(sessionsByDate)
      .filter((k) => k.startsWith(prefix))
      .sort()[0] ?? ''
  )
}

export function WorkoutCalendar({
  year,
  monthIndex,
  sessionsByDate,
  monthStats,
  prevMonthHref,
  nextMonthHref,
}: {
  year: number
  monthIndex: number // 0-11
  sessionsByDate: Record<
    string,
    { count: number; totalVolumeKg: number; lastSessionAt?: string | null }
  >
  monthStats: MonthWorkoutStats
  prevMonthHref: string
  nextMonthHref: string
}) {
  const monthYmRef = useRef<string>('')
  const [selected, setSelected] = useState<string>(() =>
    initialSelectedForMonth(year, monthIndex, sessionsByDate),
  )

  useEffect(() => {
    const ym = `${year}-${monthIndex}`
    if (monthYmRef.current === ym) return
    monthYmRef.current = ym
    setSelected(initialSelectedForMonth(year, monthIndex, sessionsByDate))
  }, [year, monthIndex, sessionsByDate])

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
  const detailDateLabel = selected
    ? formatDateKeyLocal(selected, 'es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const volumeShare =
    selectedInfo && monthStats.maxDayVolumeKg > 0
      ? Math.min(100, Math.round((selectedInfo.totalVolumeKg / monthStats.maxDayVolumeKg) * 100))
      : 0

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,340px)]">
      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Calendario</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground capitalize">{label}</p>
          </div>
          <div className="flex items-center gap-1 sm:shrink-0">
            <Button variant="outline" size="icon" className="size-10 rounded-lg" asChild>
              <Link href={prevMonthHref} aria-label="Mes anterior" prefetch>
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="size-10 rounded-lg" asChild>
              <Link href={nextMonthHref} aria-label="Mes siguiente" prefetch>
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day) => {
              const info = sessionsByDate[day.dateKey]
              const hasSession = Boolean(info)
              const isSelected = Boolean(selected && day.dateKey === selected)

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => setSelected(day.dateKey)}
                  className={cn(
                    'relative min-h-11 rounded-xl border px-1 py-1.5 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 sm:min-h-12',
                    'touch-manipulation active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    day.inMonth ? 'bg-card' : 'bg-muted/25',
                    !day.inMonth && 'opacity-55',
                    isSelected
                      ? 'z-[1] border-primary/80 shadow-[0_0_0_1px_hsl(var(--primary))] ring-2 ring-primary/25'
                      : 'border-border/70 hover:border-primary/45 hover:bg-muted/30',
                  )}
                >
                  <div
                    className={cn(
                      'text-xs font-semibold tabular-nums sm:text-sm',
                      day.inMonth ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {Number(day.dateKey.split('-')[2])}
                  </div>
                  {hasSession ? (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="block size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span className="text-[10px] font-medium tabular-nums text-foreground/85 sm:text-[11px]">
                        {info.count}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 h-1.5" aria-hidden />
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5">
        <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Detalle del día</CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Mismo criterio de fecha que la cuadrícula (zona horaria local).
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selected ? (
              <>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha</p>
                  <p className="mt-1 text-base font-semibold capitalize leading-snug text-foreground sm:text-lg">
                    {detailDateLabel}
                  </p>
                </div>

                {selectedInfo ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="tabular-nums">
                        {selectedInfo.count} {selectedInfo.count === 1 ? 'sesión' : 'sesiones'}
                      </Badge>
                      {selectedInfo.lastSessionAt ? (
                        <span className="text-xs text-muted-foreground">
                          Última:{' '}
                          {new Date(selectedInfo.lastSessionAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">Volumen en el día</span>
                        <span className="text-lg font-semibold tabular-nums tracking-tight text-foreground">
                          {Math.round(selectedInfo.totalVolumeKg)} kg
                        </span>
                      </div>
                      {monthStats.maxDayVolumeKg > 0 ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <div className="flex justify-between text-[11px] text-muted-foreground sm:text-xs">
                            <span>Frente al máximo del mes</span>
                            <span className="tabular-nums">{volumeShare}%</span>
                          </div>
                          <Progress value={volumeShare} className="h-2" />
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-sm">
                      <p className="font-medium text-foreground">Resumen del mes</p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-muted-foreground">
                        <li className="flex justify-between gap-2">
                          <span>Promedio por sesión</span>
                          <span className="tabular-nums font-medium text-foreground">
                            {monthStats.sessionCount > 0
                              ? `${Math.round(monthStats.avgVolumePerSession)} kg`
                              : '—'}
                          </span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span>Días con entreno</span>
                          <span className="tabular-nums font-medium text-foreground">
                            {monthStats.uniqueDays}
                          </span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span>Volumen acumulado</span>
                          <span className="tabular-nums font-medium text-foreground">
                            {Math.round(monthStats.totalVolumeKg)} kg
                          </span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    No hay entrenamientos registrados en este día.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona un día en el calendario.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
