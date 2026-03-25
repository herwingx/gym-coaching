/**
 * Zona horaria IANA para contar entrenos “antes de las 8:00” (hitos tipo Guerrero Madrugador).
 * En servidor: `ACHIEVEMENTS_EARLY_TZ`. En cliente (si hiciera falta): `NEXT_PUBLIC_ACHIEVEMENTS_EARLY_TZ`.
 */
export function getAchievementsEarlyWorkoutTimezone(): string {
  if (typeof process !== 'undefined' && process.env.ACHIEVEMENTS_EARLY_TZ) {
    return process.env.ACHIEVEMENTS_EARLY_TZ
  }
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ACHIEVEMENTS_EARLY_TZ) {
    return process.env.NEXT_PUBLIC_ACHIEVEMENTS_EARLY_TZ
  }
  return 'Europe/Madrid'
}

/** Etiquetas en español para valores de goal en clients/profiles */
export const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Pérdida de grasa',
  muscle_gain: 'Ganar masa muscular',
  toning: 'Fuerza',
  endurance: 'Resistencia',
  maintenance: 'Bienestar general',
}

export function getGoalLabel(goal: string | null | undefined): string {
  if (!goal) return '-'
  return GOAL_LABELS[goal] ?? goal
}
