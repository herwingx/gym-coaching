import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkoutCalendar } from '@/components/calendar/workout-calendar'

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

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild aria-label="Volver al dashboard">
            <Link href="/client/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Calendario</h1>
            <p className="text-sm text-muted-foreground">Días con entrenamientos completados</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container py-8" tabIndex={-1}>
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
      </main>
    </div>
  )
}

