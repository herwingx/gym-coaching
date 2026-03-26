/**
 * ¿Registrar carga externa (kg) y PRs por peso×reps?
 *
 * - Tipos distintos de `strength`: no hay campo de kg en la app.
 * - `strength` con equipo **solo peso corporal**: tampoco (flexiones, dominadas, saltos BW sin lastre).
 * - `strength` con mancuerna, barra, máquina, etc.: sí.
 *
 * Progresión con chaleco/lastre: usa un equipo distinto en BD (p. ej. `weighted`) o un ejercicio
 * catalogado sin `body weight`, para que siga saliendo el control de kg.
 */
export function exerciseUsesExternalLoad(
  exerciseType: string | null | undefined,
  usesExternalLoad?: boolean | null,
  equipment?: string | null,
): boolean {
  if (typeof usesExternalLoad === 'boolean') return usesExternalLoad

  const eq = (equipment ?? '').trim().toLowerCase()
  if (eq === 'body weight' || eq === 'bodyweight') return false

  const t = (exerciseType ?? 'strength').trim().toLowerCase()
  return t === 'strength'
}
