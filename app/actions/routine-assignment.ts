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

  // Assign routine
  const { data, error } = await supabase
    .from('client_routines')
    .insert({
      client_id: clientId,
      routine_id: routineId,
      notes,
      is_active: true,
    })
    .select()

  if (error) throw error

  // Workout/dashboard usan client_routines activa como fuente de verdad
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

  const routine = clientRoutine.routines
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

  // Get next workout day details
  const { data: routineDay, error: dayError } = await supabase
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
          primary_muscle
        )
      )
    `)
    .eq('routine_id', clientRoutine.routine_id)
    .eq('day_number', nextDay)
    .single()

  if (dayError) {
    return {
      isComplete: false,
      week: nextWeek,
      day: nextDay,
      isRestDay: true,
      message: 'Dia de descanso! Recuperate bien 💪',
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

  // Get all exercise logs for this client routine in the last week
  const { data: exerciseLogs, error } = await supabase
    .from('exercise_logs')
    .select(`
      id,
      exercise_name,
      weight,
      reps,
      set_number,
      is_pr,
      personal_records (
        max_weight,
        max_reps
      )
    `)
    .gte('performed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('performed_at', { ascending: false })

  if (error) throw error

  const progressionSuggestions = []

  // Analyze progression opportunities
  const groupedByExercise = exerciseLogs.reduce((acc, log) => {
    if (!acc[log.exercise_name]) {
      acc[log.exercise_name] = []
    }
    acc[log.exercise_name].push(log)
    return acc
  }, {})

  for (const [exercise, logs] of Object.entries(groupedByExercise)) {
    if (logs.length > 0) {
      const lastLog = logs[0]
      const avgWeight = logs.reduce((sum, log) => sum + (log.weight || 0), 0) / logs.length

      // Suggest 5% increase if consistent
      if (lastLog.weight && avgWeight > lastLog.weight * 0.9) {
        progressionSuggestions.push({
          exercise,
          currentWeight: lastLog.weight,
          suggestedWeight: Math.round(lastLog.weight * 1.05 * 10) / 10,
          reason: 'Has been performing consistently',
        })
      }

      // Suggest reps increase if weight stable
      if (lastLog.reps && lastLog.reps >= 12) {
        progressionSuggestions.push({
          exercise,
          currentReps: lastLog.reps,
          suggestedReps: lastLog.reps + 2,
          reason: 'Can increase reps for overload',
        })
      }
    }
  }

  return progressionSuggestions
}
