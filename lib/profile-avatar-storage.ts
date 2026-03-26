import type { SupabaseClient } from '@supabase/supabase-js'

export const PROFILE_AVATAR_BUCKET = 'avatars' as const
export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp'

const MIME_TO_EXT: Record<string, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function profileAvatarStoragePath(userId: string, ext: 'jpg' | 'png' | 'webp'): string {
  return `${userId}/profile.${ext}`
}

export function resolveProfileAvatarMime(file: File): string | null {
  if (file.type && MIME_TO_EXT[file.type]) return file.type
  const name = file.name.toLowerCase()
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.webp')) return 'image/webp'
  return null
}

function extForProfileAvatarMime(mime: string): 'jpg' | 'png' | 'webp' | null {
  return MIME_TO_EXT[mime] ?? null
}

export type ProfileAvatarUploadResult =
  | { ok: true; publicUrl: string; path: string }
  | { ok: false; error: string }

/**
 * Sube una sola foto de perfil por usuario en Storage (ruta acotada por RLS).
 * Borra otros `profile.*` previos en la carpeta del usuario.
 */
export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<ProfileAvatarUploadResult> {
  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return { ok: false, error: 'La imagen supera 2 MB. Elige otra más pequeña.' }
  }

  const mime = resolveProfileAvatarMime(file)
  if (!mime) {
    return { ok: false, error: 'Formato no permitido. Usa JPG, PNG o WebP.' }
  }

  const ext = extForProfileAvatarMime(mime)
  if (!ext) {
    return { ok: false, error: 'Formato no permitido. Usa JPG, PNG o WebP.' }
  }

  const path = profileAvatarStoragePath(userId, ext)

  const { data: existing, error: listErr } = await supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .list(userId, { limit: 100 })

  if (listErr) {
    return { ok: false, error: 'No pudimos preparar la subida. Intenta de nuevo.' }
  }

  const toRemove =
    existing?.filter((o) => o.name.startsWith('profile.')).map((o) => `${userId}/${o.name}`) ?? []

  if (toRemove.length > 0) {
    const { error: rmErr } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove(toRemove)
    if (rmErr) {
      return { ok: false, error: 'No pudimos reemplazar la foto anterior. Intenta de nuevo.' }
    }
  }

  const { error: upErr } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).upload(path, file, {
    contentType: mime,
    cacheControl: '3600',
    upsert: true,
  })

  if (upErr) {
    console.error('avatar upload', upErr)
    return { ok: false, error: 'No pudimos subir la imagen. Revisa formato y tamaño.' }
  }

  const { data: pub } = supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(path)
  
  // Agregar un timestamp para evitar que el navegador muestre la imagen cacheada anterior
  const publicUrlWithTimestamp = `${pub.publicUrl}?v=${Date.now()}`
  
  return { ok: true, publicUrl: publicUrlWithTimestamp, path }
}
