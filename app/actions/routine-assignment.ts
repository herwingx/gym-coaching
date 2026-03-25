'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-utils'

export async function assignRoutineToClient(
  clientId: string,
  routineId: string,
  notes?: string
) {
  const user = await getAuthUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Verify user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can assign routines')
  }

  // Verificar que el cliente pertenece al coach
  const { data: clientCheck } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('coach_id', user.id)
    .single()

  if (!clientCheck) {
    throw new Error('No puedes asignar rutinas a clientes que no son tuyos')
  }

  // Desactivar rutinas previas del cliente
  await supabase
    .from('client_routines')
    .update({ is_active: false })
    .eq('client_id', clientId)

  // Asignar rutina en client_routines
  const { data, error } = await supabase
    .from('client_routines')
    .insert({
      client_id: clientId,
      routine_id: routineId,
      assigned_by: user.id,
      notes,
      is_active: true,
    })
    .select()

  if (error) throw error

  // Sincronizar clients.assigned_routine_id para vistas que lo usan
  await supabase
    .from('clients')
    .update({ assigned_routine_id: routineId })
    .eq('id', clientId)

  return data[0]
}

export async function getClientRoutines(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('client_routines')
    .select(`
      id,
      routine_id,
      current_week,
      current_day_index,
      is_active,
      routines (
        id,
        name,
        duration_weeks,
        days_per_week,
        description
      )
    `)
    .eq('client_id', clientId)
    .eq('is_active', true)

  if (error) throw error
  return data
}

export async function updateClientRoutineProgress(
  clientRoutineId: string,
  weekNumber: number,
  dayNumber: number,
  workoutSessionId?: string
) {
  const user = await getAuthUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Update week progress
  const { data, error } = await supabase
    .from('routine_week_progress')
    .upsert({
      client_routine_id: clientRoutineId,
      week_number: weekNumber,
      day_number: dayNumber,
      workout_session_id: workoutSessionId,
      completed_at: new Date(),
    })
    .select()

  if (error) throw error

  // Update client_routines current week/day
  const { error: updateError } = await supabase
    .from('client_routines')
    .update({
      current_week: weekNumber,
      current_day_index: dayNumber,
    })
    .eq('id', clientRoutineId)

  if (updateError) throw updateError
  return data[0]
}

export async function getNextWorkoutDay(clientRoutineId: string) {
  const supabase = await createClient()

  // Get current client routine
  const { data: clientRoutine, error: routineError } = await supabase
    .from('client_routines')
    .select(`
      id,
      current_week,
      current_day_index,
      routine_id,
      routines (
        duration_weeks,
        days_per_week
      )
    `)
    .eq('id', clientRoutineId)
    .single()

  if (routineError) throw routineError

  const raw = clientRoutine.routines as
    | { duration_weeks: number; days_per_week: number }
    | { duration_weeks: number; days_per_week: number }[]
    | null
  const routine = Array.isArray(raw) ? raw[0] : raw
  if (!routine) throw new Error('Rutina no encontrada para esta asignación')

  const currentWeek = clientRoutine.current_week
  const currentDay = clientRoutine.current_day_index
  const daysPerWeek = routine.days_per_week
  const totalWeeks = routine.duration_weeks

  // Calculate next day
  let nextDay = currentDay + 1
  let nextWeek = currentWeek

  if (nextDay >= daysPerWeek) {
    nextDay = 0
    nextWeek += 1

    // Check if routine is complete
    if (nextWeek > totalWeeks) {
      return {
        isComplete: true,
        message: 'Rutina completada! Felicidades!',
        suggestedAction: 'Puedes repetir la rutina o asignar una nueva',
      }
    }
  }

  // Get next workout day details (nextDay is 0-based index; routine_days.day_number is 1-based)
  const { data: routineDays, error: daysError } = await supabase
    .from('routine_days')
    .select(`
      id,
      day_number,
      day_name,
      is_rest_day,
      routine_exercises (
        id,
        sets,
        reps,
        rest_seconds,
        exercises (
          id,
          name,
          primary_muscle,
          secondary_muscle,
          equipment,
          exercise_type,
          gif_url,
          image_url,
          demo_video_url,
          instructions,
          target_muscles,
          technique_notes
        )
      )
    `)
    .eq('routine_id', clientRoutine.routine_id)
    .order('day_number', { ascending: true })

  const routineDay = routineDays?.[nextDay]

  if (daysError || !routineDay) {
    return {
      isComplete: false,
      week: nextWeek,
      day: nextDay,
      isRestDay: true,
      message: 'Día de descanso. Recuperate bien.',
    }
  }

  return {
    isComplete: false,
    week: nextWeek,
    day: nextDay,
    dayName: routineDay.day_name,
    isRestDay: routineDay.is_rest_day,
    exercises: routineDay.routine_exercises || [],
    message: `Semana ${nextWeek}, Dia ${nextDay + 1}: ${routineDay.day_name}`,
  }
}

export async function suggestProgressionWeekly(clientRoutineId: string) {
  const supabase = await createClient()

  const { data: clientRoutine } = await supabase
    .from('client_routines')
    .select('client_id')
    .eq('id', clientRoutineId)
    .single()

  if (!clientRoutine?.client_id) return []

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('client_id', clientRoutine.client_id)
    .gte('started_at', weekAgo)

  const sessionIds = (sessions ?? []).map((s) => s.id)
  if (sessionIds.length === 0) return []

  const { data: logs } = await supabase
    .from('exercise_logs')
    .select(`id, weight_kg, reps, set_number, is_pr, exercise_id, exercises(name)`)
    .in('workout_session_id', sessionIds)
    .order('created_at', { ascending: false })

  const progressionSuggestions: { exercise: string; currentWeight?: number; suggestedWeight?: number; currentReps?: number; suggestedReps?: number; reason: string }[] = []

  const groupedByExercise = (logs ?? []).reduce<Record<string, typeof logs>>((acc, log) => {
    const name = (log.exercises as { name?: string })?.name ?? log.exercise_id
    if (!acc[name]) acc[name] = []
    acc[name].push(log)
    return acc
  }, {})

  for (const [exercise, logList] of Object.entries(groupedByExercise)) {
    if (!logList?.length) continue
    const lastLog = logList[0]
    const avgWeight = logList.reduce((sum, l) => sum + (l.weight_kg || 0), 0) / logList.length

    if (lastLog.weight_kg && avgWeight > lastLog.weight_kg * 0.9) {
      progressionSuggestions.push({
        exercise,
        currentWeight: lastLog.weight_kg,
        suggestedWeight: Math.round(lastLog.weight_kg * 1.05 * 10) / 10,
        reason: 'Has sido consistente, intenta subir un poco',
      })
    }
    if (lastLog.reps != null && lastLog.reps >= 12) {
      progressionSuggestions.push({
        exercise,
        currentReps: lastLog.reps,
        suggestedReps: lastLog.reps + 2,
        reason: 'Puedes aumentar reps para sobrecarga',
      })
    }
  }

  return progressionSuggestions
}
