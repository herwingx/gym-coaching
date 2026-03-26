'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import {
  buildWeeklyProgressionSuggestions,
  type WeeklyLogRow,
} from '@/lib/weekly-progression-suggestions'
import {
  getNextRoutineDayIndex,
  sortRoutineDaysByDayNumber,
} from '@/lib/next-routine-day'

export async function restartClientRoutine(clientRoutineId: string) {
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
    throw new Error('Only admins can restart routines')
  }

  // Update client_routines current week/day
  const { error: updateError } = await supabase
    .from('client_routines')
    .update({
      current_week: 1,
      current_day_index: 0,
    })
    .eq('id', clientRoutineId)

  if (updateError) throw updateError
  
  revalidatePath('/admin/dashboard')
  revalidatePath('/client/dashboard')
  
  return { success: true }
}

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

  const { data: clientRoutine, error: routineError } = await supabase
    .from('client_routines')
    .select(`
      id,
      client_id,
      current_week,
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
    | { duration_weeks: number | null; days_per_week: number }
    | { duration_weeks: number | null; days_per_week: number }[]
    | null
  const routine = Array.isArray(raw) ? raw[0] : raw
  if (!routine) throw new Error('Rutina no encontrada para esta asignación')

  const totalWeeks = routine.duration_weeks ?? 0
  if (totalWeeks > 0 && clientRoutine.current_week > totalWeeks) {
    return {
      isComplete: true,
      message: '¡Felicidades! Rutina completada 🏆',
      suggestedAction: `Has completado las ${totalWeeks} semanas de esta rutina. Hemos notificado a tu coach para que revise tu progreso y te asigne el siguiente reto.`,
    }
  }

  const { data: routineDaysRaw, error: daysError } = await supabase
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

  if (daysError) throw daysError

  const sortedDays = sortRoutineDaysByDayNumber(routineDaysRaw ?? [])
  if (!sortedDays.length) {
    return {
      isComplete: false,
      week: clientRoutine.current_week,
      day: 0,
      isRestDay: true,
      message: 'No hay días configurados en esta rutina.',
    }
  }

  const planDayIdSet = new Set(sortedDays.map((d) => d.id))

  const { data: recentSessions } = await supabase
    .from('workout_sessions')
    .select('routine_day_id')
    .eq('client_id', clientRoutine.client_id)
    .eq('status', 'completed')
    .not('routine_day_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  let lastRoutineDayId: string | null = null
  for (const row of recentSessions ?? []) {
    const rid = row.routine_day_id as string | null
    if (rid && planDayIdSet.has(rid)) {
      lastRoutineDayId = rid
      break
    }
  }

  const nextIdx = getNextRoutineDayIndex(sortedDays, lastRoutineDayId)
  const routineDay = nextIdx === null ? null : sortedDays[nextIdx]

  if (!routineDay) {
    return {
      isComplete: false,
      week: clientRoutine.current_week,
      day: 0,
      isRestDay: true,
      message: 'Día de descanso. Recuperate bien.',
    }
  }

  const blockLabel = routineDay.day_name
    ? `Día ${routineDay.day_number} · ${routineDay.day_name}`
    : `Día ${routineDay.day_number}`

  return {
    isComplete: false,
    week: clientRoutine.current_week,
    day: nextIdx,
    dayName: routineDay.day_name,
    isRestDay: routineDay.is_rest_day,
    exercises: routineDay.routine_exercises || [],
    message: `Próximo bloque: ${blockLabel}`,
  }
}

export async function suggestProgressionWeekly(clientRoutineId: string) {
  const user = await getAuthUser()
  if (!user) return []

  const supabase = await createClient()

  const { data: clientRoutine, error: crErr } = await supabase
    .from('client_routines')
    .select('client_id')
    .eq('id', clientRoutineId)
    .single()

  if (crErr || !clientRoutine?.client_id) return []

  const { data: clientRow } = await supabase
    .from('clients')
    .select('user_id')
    .eq('id', clientRoutine.client_id)
    .single()

  if (clientRow?.user_id !== user.id) return []

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
    .select(
      `exercise_id, weight_kg, reps, is_warmup, created_at, workout_session_id, exercises(name, exercise_type, uses_external_load, equipment)`,
    )
    .in('workout_session_id', sessionIds)
    .order('created_at', { ascending: true })

  return buildWeeklyProgressionSuggestions((logs ?? []) as WeeklyLogRow[])
}
