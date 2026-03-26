import { exerciseUsesExternalLoad } from '@/lib/exercise-tracking'

export type WeeklyLogRow = {
  exercise_id: string
  weight_kg: number | null
  reps: number | null
  is_warmup: boolean | null
  created_at: string
  workout_session_id: string
  exercises:
    | {
        name: string
        exercise_type: string
        uses_external_load?: boolean | null
        equipment?: string | null
      }
    | {
        name: string
        exercise_type: string
        uses_external_load?: boolean | null
        equipment?: string | null
      }[]
    | null
}

export type WeeklyProgressionSuggestion = {
  exerciseId: string
  exercise: string
  suggestedWeight?: number
  suggestedReps?: number
  reason: string
}

function metaFromRow(row: WeeklyLogRow): {
  name: string
  exerciseType: string
  usesExternalLoad?: boolean | null
  equipment?: string | null
} {
  const ex = row.exercises
  const m = Array.isArray(ex) ? ex[0] : ex
  return {
    name: m?.name?.trim() || 'Ejercicio',
    exerciseType: m?.exercise_type ?? '',
    usesExternalLoad: m?.uses_external_load,
    equipment: m?.equipment,
  }
}

function roundLoadIncrement(value: number, inc: number): number {
  if (!Number.isFinite(value) || inc <= 0) return value
  return Math.round(value / inc) * inc
}

/**
 * Sugerencias basadas solo en logs recientes (p. ej. última semana):
 * - **Strength**: última sesión en la que apareció el ejercicio; series de trabajo con carga estable y reps mínimas → +incremento kg.
 *   Si no hay carga real o no hay estabilidad, solo progresión por reps.
 * - **Sin carga** (cardio, hiit, movilidad…): no se sugiere kg; solo reps o calidad de movimiento.
 */
export function buildWeeklyProgressionSuggestions(
  logs: WeeklyLogRow[],
  options?: {
    minRepsForLoadBump?: number
    minRepsForBodyRepBump?: number
    loadIncrementKg?: number
    maxSuggestions?: number
  },
): WeeklyProgressionSuggestion[] {
  const minRepsLoad = options?.minRepsForLoadBump ?? 8
  const minRepsBw = options?.minRepsForBodyRepBump ?? 10
  const inc = options?.loadIncrementKg ?? 2.5
  const maxS = options?.maxSuggestions ?? 14

  const byExercise = new Map<string, WeeklyLogRow[]>()
  for (const l of logs) {
    const id = l.exercise_id
    if (!id) continue
    if (!byExercise.has(id)) byExercise.set(id, [])
    byExercise.get(id)!.push(l)
  }

  const out: WeeklyProgressionSuggestion[] = []

  for (const [exerciseId, list] of byExercise) {
    const sorted = [...list].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    const latestSid = sorted[sorted.length - 1]?.workout_session_id
    if (!latestSid) continue

    const sessionLogs = sorted.filter(
      (l) => l.workout_session_id === latestSid && !l.is_warmup,
    )
    if (sessionLogs.length === 0) continue

    const { name, exerciseType, usesExternalLoad, equipment } = metaFromRow(sessionLogs[0])
    const usesLoad = exerciseUsesExternalLoad(exerciseType, usesExternalLoad, equipment)

    const reps = sessionLogs
      .map((l) => l.reps)
      .filter((r): r is number => r != null && Number.isFinite(r) && r > 0)
    const minR = reps.length ? Math.min(...reps) : 0

    if (usesLoad) {
      const weights = sessionLogs
        .map((l) => l.weight_kg)
        .filter((w): w is number => w != null && Number.isFinite(w) && w > 0)

      if (weights.length > 0 && minR >= minRepsLoad) {
        const wMax = Math.max(...weights)
        const wMin = Math.min(...weights)
        const stableLoad = wMax - wMin <= 1.25
        if (stableLoad) {
          const next = roundLoadIncrement(wMax + inc, inc)
          if (next > wMax) {
            out.push({
              exerciseId,
              exercise: name,
              suggestedWeight: next,
              reason:
                'Última sesión: misma carga en todas las series de trabajo y reps suficientes. Prueba un aumento pequeño si mantienes la técnica.',
            })
            continue
          }
        }
      }

      if (minR >= minRepsBw + 2) {
        out.push({
          exerciseId,
          exercise: name,
          suggestedReps: minR + 2,
          reason:
            'Ya manejas bastantes repeticiones; puedes buscar una o dos más con la misma carga antes de subir peso.',
        })
        continue
      }
      if (minR >= minRepsBw) {
        out.push({
          exerciseId,
          exercise: name,
          suggestedReps: minR + 1,
          reason: 'Progresión ligera por repeticiones con la carga actual.',
        })
        continue
      }
    } else {
      if (minR >= minRepsBw) {
        out.push({
          exerciseId,
          exercise: name,
          suggestedReps: minR + 2,
          reason:
            'Sin carga externa: avanza por repeticiones, duración o mejorar la calidad del movimiento — no por kilos en la barra.',
        })
        continue
      }
      if (minR >= 6) {
        out.push({
          exerciseId,
          exercise: name,
          suggestedReps: minR + 1,
          reason: 'Suma una repetición con control o más tiempo bajo tensión.',
        })
        continue
      }
    }
  }

  out.sort((a, b) => a.exercise.localeCompare(b.exercise, 'es'))
  return out.slice(0, maxS)
}
