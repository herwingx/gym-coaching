'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getUserProfile } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'

export async function createNewRoutine(formData: FormData) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const goal = formData.get('goal') as string
  const level = formData.get('level') as string
  const daysPerWeek = parseInt(formData.get('daysPerWeek') as string) || null
  const durationWeeks = parseInt(formData.get('durationWeeks') as string) || null

  const { data, error } = await supabase
    .from('routines')
    .insert([
      {
        id: randomUUID(),
        name,
        description: description || null,
        goal: goal || null,
        level: level || null,
        days_per_week: daysPerWeek,
        duration_weeks: durationWeeks,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating routine:', error)
    throw new Error(error.message)
  }

  redirect(`/admin/routines/${data[0].id}`)
}

export async function createExercise(formData: FormData) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()

  const name = formData.get('name') as string
  const primaryMuscle = formData.get('primaryMuscle') as string
  const secondaryMuscle = formData.get('secondaryMuscle') as string
  const exerciseType = formData.get('exerciseType') as string
  const equipment = formData.get('equipment') as string
  const techniqueNotes = formData.get('techniqueNotes') as string

  const { data, error } = await supabase
    .from('exercises')
    .insert([
      {
        id: randomUUID(),
        name,
        primary_muscle: primaryMuscle || null,
        secondary_muscle: secondaryMuscle || null,
        exercise_type: exerciseType || null,
        equipment: equipment || null,
        technique_notes: techniqueNotes || null,
      },
    ])
    .select()

  if (error) {
    console.error('Error creating exercise:', error)
    throw new Error(error.message)
  }

  return data[0]
}
