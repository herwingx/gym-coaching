import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { createClient } from '@/lib/supabase/server'
import { CoachOverviewClient } from './coach-overview-client'

export type CoachOverviewMetrics = {
  totalTrainingsThisWeek: number
  prsThisMonth: number
  mostActiveClientId: string | null
  mostActiveClientName: string | null
  attentionClientId: string | null
  attentionClientName: string | null
  attentionReason: string | null
  trainingsLastWeek: number
  chartData: { date: string; sessions: number }[]
}

export type CoachClientCard = {
  id: string
  fullName: string
  avatarUrl?: string | null
  planName?: string | null
  assignedRoutineId?: string | null
  assignedRoutineName?: string | null
  status?: string | null
  lastSessionAt?: string | null
  daysSinceLastSession?: number | null
  streakDays?: number | null
  trend?: 'up' | 'down' | 'flat'
  needsAttention?: boolean
  attentionReason?: string | null
}

function safeDiffDays(fromIso?: string | null): number | null {
  if (!fromIso) return null
  const from = new Date(fromIso)
  if (Number.isNaN(from.getTime())) return null
  const now = new Date()
  const diff = Math.floor((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export async function CoachOverview() {
  const user = await getAuthUser()
  const role = await getUserRole()

  if (!user || role !== 'admin') return null

  const supabase = await createClient()

  // 1) Cargar asesorados desde clients (admin ve sus propios asesorados)
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('id, user_id, full_name, avatar_url, status, last_session_at, current_plan_id')
    .eq('coach_id', user.id)

  if (clientsError) throw clientsError
  const clientsList = (clientsData || []) as any[]

  const clientIds = clientsList.map((c) => c.id).filter(Boolean)

  // Planes para resolver current_plan_id -> plan_name
  const planIds = [...new Set(clientsList.map((c) => c.current_plan_id).filter(Boolean))]
  const plansById = new Map<string, string>()
  if (planIds.length > 0) {
    const { data: plans } = await supabase
      .from('membership_plans')
      .select('id, name')
      .in('id', planIds)
    for (const p of plans || []) plansById.set(p.id, p.name)
  }

  // Rutina activa por cliente desde client_routines
  let routineByClient = new Map<string, string>()
  if (clientIds.length > 0) {
    const { data: crData } = await supabase
      .from('client_routines')
      .select('client_id, routine_id')
      .in('client_id', clientIds)
      .eq('is_active', true)
    for (const cr of crData || []) {
      routineByClient.set(cr.client_id, cr.routine_id)
    }
  }

  const clientsSummary = clientsList.map((c) => ({
    id: c.id,
    user_id: c.user_id,
    full_name: c.full_name,
    avatar_url: c.avatar_url,
    status: c.status,
    last_session_at: c.last_session_at,
    plan_name: c.current_plan_id ? plansById.get(c.current_plan_id) ?? null : null,
    assigned_routine_id: routineByClient.get(c.id) ?? null,
  }))
  if (clientsSummary.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold">No tienes asesorados todavía</div>
        <div className="text-sm text-muted-foreground">
          Crea asesorados en Asesorados para que aparezcan aquí.
        </div>
      </div>
    )
  }

  // 2) Fetch streak days + last_workout_at
  const userIds = clientsSummary.map((c) => c.user_id).filter(Boolean)
  let profilesByUserId = new Map<string, { streak_days?: number | null; last_workout_at?: string | null }>()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, streak_days, last_workout_at')
      .in('id', userIds)

    for (const p of profiles || []) {
      profilesByUserId.set(p.id, {
        streak_days: p.streak_days,
        last_workout_at: p.last_workout_at,
      })
    }
  }

  // 3) Fetch routines for filter labels
  const routineIds = Array.from(
    new Set(clientsSummary.map((c) => c.assigned_routine_id).filter(Boolean)),
  )
  let routinesById = new Map<string, string>()
  if (routineIds.length > 0) {
    const { data: routines } = await supabase
      .from('routines')
      .select('id, name')
      .in('id', routineIds)
    for (const r of routines || []) routinesById.set(r.id, r.name)
  }

  // 4) Fetch workout sessions to compute trend + attention + metrics
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - 6)
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfLastWeek = new Date()
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 13)
  startOfLastWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const startOfLast30Days = new Date()
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29)
  startOfLast30Days.setHours(0, 0, 0, 0)

  const { data: completedSessions } = await supabase
    .from('workout_sessions')
    .select('id, client_id, started_at, total_volume_kg, status')
    .in('client_id', clientIds)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })

  const sessionsByClientId = new Map<
    string,
    { started_at?: string; total_volume_kg?: number | null }[]
  >()
  for (const s of completedSessions || []) {
    const arr = sessionsByClientId.get(s.client_id) || []
    arr.push({ started_at: s.started_at, total_volume_kg: s.total_volume_kg })
    sessionsByClientId.set(s.client_id, arr)
  }

  // Metrics (week/month)
  const { data: prs } = await supabase
    .from('personal_records')
    .select('id, client_id, achieved_at')
    .in('client_id', clientIds)
    .gte('achieved_at', startOfMonth.toISOString())

  const totalTrainingsThisWeek = (completedSessions || []).filter((s: any) => {
    const d = new Date(s.started_at)
    return d >= startOfWeek
  }).length

  const trainingsLastWeek = (completedSessions || []).filter((s: any) => {
    const d = new Date(s.started_at)
    return d >= startOfLastWeek && d < startOfWeek
  }).length

  const prsThisMonth = (prs || []).length

  // Chart data: sessions per day for last 90 days
  const chartDataMap = new Map<string, number>()
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    chartDataMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const s of completedSessions || []) {
    const dateStr = (s.started_at || '').slice(0, 10)
    if (chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, (chartDataMap.get(dateStr) || 0) + 1)
    }
  }
  const chartData = Array.from(chartDataMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({ date, sessions }))

  // Most active client in last 30 days
  const last30 = (completedSessions || []).filter((s: any) => {
    const d = new Date(s.started_at)
    return d >= startOfLast30Days
  })
  const countByClient = new Map<string, number>()
  for (const s of last30) countByClient.set(s.client_id, (countByClient.get(s.client_id) || 0) + 1)

  let mostActiveClientId: string | null = null
  let mostActiveClientName: string | null = null
  for (const [id, count] of countByClient.entries()) {
    if (!mostActiveClientId || count > (countByClient.get(mostActiveClientId) || 0)) {
      const found = clientsSummary.find((c) => c.id === id)
      mostActiveClientId = id
      mostActiveClientName = found?.full_name || found?.fullName || null
    }
  }

  const cards: CoachClientCard[] = clientsSummary.map((c) => {
    const streak = profilesByUserId.get(c.user_id)
    const last = (sessionsByClientId.get(c.id) || [])[0]
    const prev = (sessionsByClientId.get(c.id) || [])[1]

    const lastSessionAt = last?.started_at ?? c.last_session_at ?? null
    const daysSinceLastSession = safeDiffDays(lastSessionAt)

    const lastVol = typeof last?.total_volume_kg === 'number' ? last.total_volume_kg : null
    const prevVol = typeof prev?.total_volume_kg === 'number' ? prev.total_volume_kg : null

    let trend: 'up' | 'down' | 'flat' = 'flat'
    if (lastVol !== null && prevVol !== null) {
      if (lastVol > prevVol) trend = 'up'
      else if (lastVol < prevVol) trend = 'down'
    }

    const isPending = c.status === 'pending'
    const isExpired = c.status === 'expired'
    const isSuspended = c.status === 'suspended'
    const isActive = c.status === 'active'

    let attentionReason: string | null = null
    if (isPending) attentionReason = 'Falta registro'
    else if (isExpired) attentionReason = 'Plan vencido'
    else if (isSuspended) attentionReason = 'Suspendido'
    else if (isActive) {
      if (!c.assigned_routine_id) attentionReason = 'Sin rutina asignada'
      else if (daysSinceLastSession === null) attentionReason = 'No ha entrenado nunca'
      else if (daysSinceLastSession >= 7) attentionReason = `Inactivo hace ${daysSinceLastSession}d`
    }

    const needsAttention = attentionReason !== null

    return {
      id: c.id,
      fullName: c.full_name,
      avatarUrl: c.avatar_url,
      planName: c.plan_name ?? null,
      assignedRoutineId: c.assigned_routine_id ?? null,
      assignedRoutineName: c.assigned_routine_id ? routinesById.get(c.assigned_routine_id) || null : null,
      status: c.status ?? null,
      lastSessionAt,
      daysSinceLastSession,
      streakDays: streak?.streak_days ?? null,
      trend,
      needsAttention,
      attentionReason,
    }
  })

  // Re-evaluar los candidatos de atención basados en la nueva lógica de negocio
  const attentionCandidates = cards.filter((c) => c.needsAttention)
  let attentionClientId: string | null = null
  let attentionClientName: string | null = null
  
  if (attentionCandidates.length > 0) {
    // Prioridad de atención: 
    // 1. Expired, 2. No routine, 3. Inactivo +7d, 4. Pending
    const sorted = [...attentionCandidates].sort((a, b) => {
      const getScore = (c: CoachClientCard) => {
        if (c.status === 'expired') return 4
        if (c.status === 'active' && !c.assignedRoutineId) return 3
        if (c.status === 'active' && c.daysSinceLastSession !== null && c.daysSinceLastSession >= 7) return 2
        if (c.status === 'pending') return 1
        return 0
      }
      return getScore(b) - getScore(a)
    })
    attentionClientId = sorted[0]?.id ?? null
    attentionClientName = sorted[0]?.fullName ?? null
  }

  const metrics: CoachOverviewMetrics = {
    totalTrainingsThisWeek,
    prsThisMonth,
    mostActiveClientId,
    mostActiveClientName,
    attentionClientId,
    attentionClientName,
    attentionReason: attentionCandidates.length > 0 ? (cards.find(c => c.id === attentionClientId)?.attentionReason ?? null) : null,
    trainingsLastWeek,
    chartData,
  }

  return (
    <CoachOverviewClient
      cards={cards}
      metrics={metrics}
      planNames={Array.from(new Set(cards.map((c) => c.planName).filter(Boolean))) as string[]}
      routineNames={Array.from(new Set(cards.map((c) => c.assignedRoutineName).filter(Boolean))) as string[]}
    />
  )
}

