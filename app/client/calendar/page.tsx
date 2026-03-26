import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkoutCalendar, type MonthWorkoutStats } from '@/components/calendar/workout-calendar'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function clampMonthYear(y: number, m1: number) {
  const now = new Date()
  const year = Number.isFinite(y) && y >= 2020 && y <= 2100 ? y : now.getFullYear()
  let monthIndex = m1 - 1 // URL uses 1–12
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    monthIndex = now.getMonth()
  }
  return { year, monthIndex }
}

function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1)
  return { year: d.getFullYear(), monthIndex: d.getMonth() }
}

type Search = { y?: string; m?: string }

export default async function ClientCalendarPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const sp = await searchParams
  const now = new Date()
  const parsedY = sp.y != null ? Number(sp.y) : now.getFullYear()
  const parsedM = sp.m != null ? Number(sp.m) : now.getMonth() + 1
  const { year, monthIndex } = clampMonthYear(parsedY, parsedM)

  const supabase = await createClient()

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) redirect('/client/dashboard')

  const start = new Date(year, monthIndex, 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(year, monthIndex + 1, 1)
  end.setHours(0, 0, 0, 0)

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at, total_volume_kg, status')
    .eq('client_id', clientRecord.id)
    .eq('status', 'completed')
    .gte('started_at', start.toISOString())
    .lt('started_at', end.toISOString())
    .order('started_at', { ascending: true })

  const sessionsByDate: Record<
    string,
    { count: number; totalVolumeKg: number; lastSessionAt?: string | null }
  > = {}

  const dayKeys = new Set<string>()
  let totalVolMonth = 0

  for (const s of sessions || []) {
    const d = new Date(s.started_at)
    const key = toDateKey(d)
    dayKeys.add(key)
    if (!sessionsByDate[key]) {
      sessionsByDate[key] = { count: 0, totalVolumeKg: 0, lastSessionAt: null }
    }
    sessionsByDate[key].count += 1
    if (typeof s.total_volume_kg === 'number' && Number.isFinite(s.total_volume_kg)) {
      sessionsByDate[key].totalVolumeKg += s.total_volume_kg
      totalVolMonth += s.total_volume_kg
    }
    sessionsByDate[key].lastSessionAt = s.started_at
  }

  const list = sessions ?? []
  const completedThisMonth = list.length
  const monthCaption = new Date(year, monthIndex, 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })
  let maxDayVolumeKg = 0
  for (const v of Object.values(sessionsByDate)) {
    if (v.totalVolumeKg > maxDayVolumeKg) maxDayVolumeKg = v.totalVolumeKg
  }

  const monthStats: MonthWorkoutStats = {
    totalVolumeKg: totalVolMonth,
    sessionCount: completedThisMonth,
    uniqueDays: dayKeys.size,
    avgVolumePerSession: completedThisMonth > 0 ? totalVolMonth / completedThisMonth : 0,
    maxDayVolumeKg,
  }

  const prev = addMonths(year, monthIndex, -1)
  const next = addMonths(year, monthIndex, 1)
  const prevMonthHref = `/client/calendar?y=${prev.year}&m=${prev.monthIndex + 1}`
  const nextMonthHref = `/client/calendar?y=${next.year}&m=${next.monthIndex + 1}`

  const calendarSubtitle =
    completedThisMonth === 0
      ? `Sin sesiones completadas en ${monthCaption}`
      : `${completedThisMonth} ${completedThisMonth === 1 ? 'sesión' : 'sesiones'} completadas en ${monthCaption}`

  return (
    <>
      <ClientStackPageHeader title="Calendario" subtitle={calendarSubtitle} />
      <div className={CLIENT_DATA_PAGE_SHELL}>
        {!sessions || sessions.length === 0 ? (
          <Empty className="border-border/80 shadow-sm ring-1 ring-primary/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDays />
              </EmptyMedia>
              <EmptyTitle>Sin sesiones este mes</EmptyTitle>
              <EmptyDescription>
                Completa un entreno desde <span className="font-medium">Mis rutinas</span> y tu calendario se irá
                llenando automáticamente.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/client/routines">Ir a mis rutinas</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <WorkoutCalendar
            year={year}
            monthIndex={monthIndex}
            sessionsByDate={sessionsByDate}
            monthStats={monthStats}
            prevMonthHref={prevMonthHref}
            nextMonthHref={nextMonthHref}
          />
        )}
      </div>
    </>
  )
}
