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
