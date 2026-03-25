import { createClient } from '@/lib/supabase/server'

export async function getWorkoutSessions(clientId: string, limit = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(
      `
      id, client_id, routine_day_id, started_at, finished_at, duration_minutes,
      total_volume_kg, exercises_completed, exercises_skipped,
      feeling_score, feeling_note, status, created_at,
      routine_days:routine_day_id (day_name, day_number)
    `,
    )
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching workout sessions:', error)
    return []
  }

  return data || []
}

export async function getBodyMeasurements(clientId: string, limit = 200) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('body_measurements')
    .select('id, recorded_at, weight, body_fat_pct, waist_cm')
    .eq('client_id', clientId)
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching measurements:', error)
    return []
  }

  return data || []
}

export async function getClientStats(clientId: string) {
  const supabase = await createClient()
  
  // Get total sessions
  const { count: totalSessions } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('status', 'completed')

  // Get latest measurement
  const { data: latestMeasurement } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('client_id', clientId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  return {
    totalSessions: totalSessions || 0,
    latestMeasurement,
  }
}
