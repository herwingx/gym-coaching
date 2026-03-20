'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getUserProfile } from '@/lib/auth-utils'
import { randomUUID } from 'crypto'

export async function saveRoutineFromBuilder(data: {
  name: string
  description: string | null
  duration_weeks: number
  days: {
    day_number: number
    day_name: string
    is_rest_day: boolean
    exercises: { exercise_id: string; order_index: number; sets: number; reps: string }[]
  }[]
}): Promise<string> {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  const routineId = randomUUID()

  const { error: routineError } = await supabase.from('routines').insert({
    id: routineId,
    name: data.name,
    description: data.description,
    duration_weeks: data.duration_weeks,
  })

  if (routineError) throw new Error(routineError.message)

  for (const day of data.days) {
    const dayId = randomUUID()
    const { error: dayError } = await supabase.from('routine_days').insert({
      id: dayId,
      routine_id: routineId,
      day_number: day.day_number,
      day_name: day.day_name,
    })

    if (dayError) throw new Error(dayError.message)

    for (const ex of day.exercises) {
      const { error: reError } = await supabase.from('routine_exercises').insert({
        routine_day_id: dayId,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
      })
      if (reError) throw new Error(reError.message)
    }
  }

  return routineId
}
