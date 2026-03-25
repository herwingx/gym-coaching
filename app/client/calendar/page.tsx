import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkoutCalendar } from '@/components/calendar/workout-calendar'
import {
  CLIENT_DATA_PAGE_SHELL,
  ClientStackPageHeader,
} from '@/components/client/client-app-page-parts'

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export default async function ClientCalendarPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  const now = new Date()
  const year = now.getFullYear()
  const monthIndex = now.getMonth()

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

  for (const s of sessions || []) {
    const d = new Date(s.started_at)
    const key = toDateKey(d)
    if (!sessionsByDate[key]) {
      sessionsByDate[key] = { count: 0, totalVolumeKg: 0, lastSessionAt: null }
    }
    sessionsByDate[key].count += 1
    if (typeof s.total_volume_kg === 'number') {
      sessionsByDate[key].totalVolumeKg += s.total_volume_kg
    }
    sessionsByDate[key].lastSessionAt = s.started_at
  }

  const list = sessions ?? []
  const completedThisMonth = list.length
  const monthCaption = now.toLocaleDateString('es', { month: 'long', year: 'numeric' })
  const calendarSubtitle =
    completedThisMonth === 0
      ? `Sin sesiones completadas en ${monthCaption}`
      : `${completedThisMonth} ${completedThisMonth === 1 ? 'sesión' : 'sesiones'} completadas en ${monthCaption}`

  return (
    <>
      <ClientStackPageHeader title="Calendario" subtitle={calendarSubtitle} />
      <div className={`${CLIENT_DATA_PAGE_SHELL} gap-6`}>
        {!sessions ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sin entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Aún no tienes sesiones completadas este mes.</p>
            </CardContent>
          </Card>
        ) : (
          <WorkoutCalendar year={year} monthIndex={monthIndex} sessionsByDate={sessionsByDate} />
        )}
      </div>
    </>
  )
}

