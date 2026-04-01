import type { Exercise } from '@/lib/types'

/**
 * Helper utilities para preferir los campos en español (`_es`)
 * cuando están disponibles, con fallback automático al inglés.
 *
 * Uso:  `exName(exercise)` → nombre en español si existe, o en inglés.
 */

/** Nombre (preferir name_es) */
export function exName(ex: Exercise | null | undefined): string {
  return ex?.name_es || ex?.name || 'Ejercicio'
}

/** Equipo (preferir equipment_es) */
export function exEquipment(ex: Exercise | null | undefined): string | undefined {
  return ex?.equipment_es || ex?.equipment || undefined
}

/** Músculos objetivo (preferir target_muscles_es) */
export function exTargetMuscles(ex: Exercise | null | undefined): string[] {
  const arr = ex?.target_muscles_es?.length ? ex.target_muscles_es : ex?.target_muscles
  return arr?.filter(Boolean) ?? []
}

/** Partes del cuerpo (preferir body_parts_es) */
export function exBodyParts(ex: Exercise | null | undefined): string[] {
  const arr = ex?.body_parts_es?.length ? ex.body_parts_es : ex?.body_parts
  return arr?.filter(Boolean) ?? []
}

/** Músculos secundarios (preferir secondary_muscles_es) */
export function exSecondaryMuscles(ex: Exercise | null | undefined): string[] {
  const arr = ex?.secondary_muscles_es?.length ? ex.secondary_muscles_es : ex?.secondary_muscles
  return arr?.filter(Boolean) ?? []
}

/** Instrucciones (preferir instructions_es) */
export function exInstructions(ex: Exercise | null | undefined): string[] {
  const arr = ex?.instructions_es?.length ? ex.instructions_es : ex?.instructions
  return arr?.filter(Boolean) ?? []
}
