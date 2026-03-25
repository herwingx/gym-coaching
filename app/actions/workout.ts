'use server'

import { createClient } from '@/lib/supabase/server'
import { calculate1RM } from '@/lib/types'
import { awardXP, updateStreak, checkAchievements, XP_REWARDS } from '@/lib/gamification'

interface SetData {
  exerciseId: string
  setNumber: number
  weight: number
  reps: number
  rpe?: number
  isWarmup?: boolean
  isPR?: boolean
}

interface WorkoutCompletionData {
  clientId: string
  routineDayId?: string
  sets: SetData[]
  durationMinutes: number
  rating?: number
  notes?: string
}

export async function startWorkoutSession(clientId: string, routineDayId?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      client_id: clientId,
      routine_day_id: routineDayId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      exercises_completed: 0,
      exercises_skipped: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error starting workout:', error)
    return { success: false, error: error.message }
  }

  return { success: true, sessionId: data.id }
}

export async function completeWorkoutSession(data: WorkoutCompletionData) {
  const supabase = await createClient()

  // Get user ID and total_sessions from client
  const { data: client } = await supabase
    .from('clients')
    .select('user_id, total_sessions')
    .eq('id', data.clientId)
    .single()

  if (!client?.user_id) {
    return { success: false, error: 'Cliente no encontrado' }
  }

  // Create workout session
  const totalVolume = data.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
  const uniqueExercises = new Set(data.sets.map(s => s.exerciseId)).size

  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      client_id: data.clientId,
      routine_day_id: data.routineDayId,
      status: 'completed',
      started_at: new Date(Date.now() - data.durationMinutes * 60000).toISOString(),
      finished_at: new Date().toISOString(),
      duration_minutes: data.durationMinutes,
      exercises_completed: uniqueExercises,
      exercises_skipped: 0,
      total_volume_kg: totalVolume,
      feeling_score: data.rating,
      feeling_note: data.notes,
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Error creating session:', sessionError)
    return { success: false, error: sessionError.message }
  }

  // Log all sets (exercise_logs requiere user_id)
  const exerciseLogs = data.sets.map(set => ({
    workout_session_id: session.id,
    user_id: client.user_id,
    exercise_id: set.exerciseId,
    set_number: set.setNumber,
    weight_kg: set.weight,
    reps: set.reps,
    rpe: set.rpe,
    is_warmup: set.isWarmup || false,
    is_pr: set.isPR || false,
  }))

  await supabase.from('exercise_logs').insert(exerciseLogs)

  const prSets = data.sets.filter((s) => s.isPR)
  const prExerciseIds = [...new Set(prSets.map((s) => s.exerciseId))]
  const { data: exerciseRows } =
    prExerciseIds.length > 0
      ? await supabase.from('exercises').select('id, name').in('id', prExerciseIds)
      : { data: [] as { id: string; name: string }[] }
  const nameById = new Map((exerciseRows ?? []).map((e) => [e.id, e.name]))

  for (const prSet of prSets) {
    const estimated1RM = calculate1RM(prSet.weight, prSet.reps)
    const exerciseName = nameById.get(prSet.exerciseId) ?? undefined

    await supabase.from('personal_records').upsert(
      {
        client_id: data.clientId,
        exercise_id: prSet.exerciseId,
        exercise_name: exerciseName ?? '',
        weight_kg: prSet.weight,
        reps: prSet.reps,
        estimated_1rm: estimated1RM,
        achieved_at: new Date().toISOString(),
      },
      {
        onConflict: 'client_id,exercise_id',
      },
    )
  }

  // Update client stats
  await supabase
    .from('clients')
    .update({
      total_sessions: (client.total_sessions ?? 0) + 1,
      last_session_at: new Date().toISOString(),
    })
    .eq('id', data.clientId)

  // Gamification: Award XP
  let totalXP = XP_REWARDS.COMPLETE_WORKOUT
  if (prSets.length > 0) {
    totalXP += XP_REWARDS.NEW_PR * prSets.length
  }

  const xpResult = await awardXP(client.user_id, totalXP)
  
  // Update streak
  const streakResult = await updateStreak(client.user_id)
  if (streakResult.streakDays > 1) {
    await awardXP(client.user_id, XP_REWARDS.STREAK_DAY)
  }

  // Check for new achievements
  const newAchievements = await checkAchievements(client.user_id)

  return {
    success: true,
    sessionId: session.id,
    stats: {
      totalVolume,
      prsCount: prSets.length,
      xpEarned: totalXP,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      streakDays: streakResult.streakDays,
      newAchievements,
    }
  }
}

export async function getExerciseHistory(clientId: string, exerciseId: string, limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exercise_logs')
    .select(`
      *,
      workout_sessions!inner(client_id)
    `)
    .eq('workout_sessions.client_id', clientId)
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching exercise history:', error)
    return []
  }

  return data
}

export async function getPersonalRecords(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('personal_records')
    .select(`
      *,
      exercises(name, primary_muscle)
    `)
    .eq('client_id', clientId)
    .order('achieved_at', { ascending: false })

  if (error) {
    console.error('Error fetching PRs:', error)
    return []
  }

  return data
}
