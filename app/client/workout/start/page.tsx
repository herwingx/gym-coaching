import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkoutActiveSession } from './workout-active-session'

export default async function WorkoutStartPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Get client
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!client) redirect('/client/dashboard')

  // Obtener routine_id: de clients.assigned_routine_id o de client_routines activa
  let routineId = (client as any).assigned_routine_id
  if (!routineId) {
    const { data: activeRoutine } = await supabase
      .from('client_routines')
      .select('routine_id')
      .eq('client_id', client.id)
      .eq('is_active', true)
      .limit(1)
      .single()
    routineId = activeRoutine?.routine_id
  }

  if (!routineId) redirect('/client/dashboard')

  // Get routine with all data
  const { data: routine } = await supabase
    .from('routines')
    .select(`
      *,
      routine_days (
        *,
        routine_exercises (
          *,
          exercises (*)
        )
      )
    `)
    .eq('id', routineId)
    .single()

  if (!routine) {
    redirect('/client/dashboard')
  }

  // Get last session to determine current day
  const { data: lastSession } = await supabase
    .from('workout_sessions')
    .select('routine_day_id')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Find next routine day
  const routineDays = routine.routine_days || []
  let currentDayIndex = 0
  
  if (lastSession?.routine_day_id) {
    const lastDayIndex = routineDays.findIndex((d: any) => d.id === lastSession.routine_day_id)
    currentDayIndex = (lastDayIndex + 1) % routineDays.length
  }

  const currentDay = routineDays[currentDayIndex]

  // Get previous logs for weight suggestions
  const { data: previousLogs } = await supabase
    .from('exercise_logs')
    .select('exercise_id, weight_kg, reps')
    .eq('workout_session_id', lastSession?.routine_day_id || '')
    .order('created_at', { ascending: false })

  // Get PRs for comparison
  const { data: personalRecords } = await supabase
    .from('personal_records')
    .select('*')
    .eq('client_id', client.id)

  return (
    <WorkoutActiveSession
      clientId={client.id}
      routineDay={currentDay}
      routineName={routine.name}
      previousLogs={previousLogs || []}
      personalRecords={personalRecords || []}
    />
  )
}
