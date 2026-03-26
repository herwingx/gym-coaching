'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getUserProfile } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

function emptyToNull(s: string | null | undefined) {
  const t = s?.trim()
  return t ? t : null
}

export async function createAdminExercise(formData: FormData) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const name = emptyToNull(formData.get('name') as string)
  if (!name) {
    throw new Error('El nombre es obligatorio')
  }

  const primaryMuscle = emptyToNull(formData.get('primaryMuscle') as string) ?? 'full_body'
  const exerciseType = emptyToNull(formData.get('exerciseType') as string) ?? 'strength'

  const supabase = await createClient()

  const row: Record<string, unknown> = {
    id: randomUUID(),
    name,
    primary_muscle: primaryMuscle,
    secondary_muscle: emptyToNull(formData.get('secondaryMuscle') as string),
    exercise_type: exerciseType,
    equipment: emptyToNull(formData.get('equipment') as string),
    technique_notes: emptyToNull(formData.get('techniqueNotes') as string),
    gif_url: emptyToNull(formData.get('gifUrl') as string),
    image_url: emptyToNull(formData.get('imageUrl') as string),
    demo_video_url: emptyToNull(formData.get('demoVideoUrl') as string),
  }

  const { data, error } = await supabase.from('exercises').insert(row)
    .select('id')
    .single()

  if (error) {
    console.error('createAdminExercise', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/exercises')
  revalidatePath('/admin/exercises/new')
  revalidatePath('/admin/routines/builder')

  return { id: data.id as string }
}

export async function getExercisesForSelector() {
  const supabase = await createClient()

  // Fetch all exercises (handling 1000 row limit)
  let allExercises: any[] = []
  let from = 0
  let to = 999
  
  while (true) {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, gif_url, body_parts, target_muscles, equipments, primary_muscle, exercise_type, equipment')
      .order('name')
      .range(from, to)
    
    if (error || !data || data.length === 0) break
    allExercises = [...allExercises, ...data]
    if (data.length < 1000) break
    from += 1000
    to += 1000
  }

  return allExercises
}
