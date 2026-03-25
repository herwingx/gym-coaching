/**
 * Reglas estables para hitos de fuerza relativa (1RM vs peso corporal).
 * IDs alineados con el catálogo ExerciseDB (columna exercises.id, texto).
 * Si el usuario tiene un PR en otro ejercicio, hace fallback por nombre en `liftBenchmarkKind`.
 */

/** Press banca plano (referencia principal 1× BW) */
export const BENCH_BENCHMARK_EXERCISE_IDS = new Set<string>(['25'])

/** Sentadillas con barra de referencia para KPIs de sentadilla */
export const SQUAT_BENCHMARK_EXERCISE_IDS = new Set<string>([
  '42', // barbell front squat
  '43', // barbell full squat
  '46', // barbell hack squat
  '63', // barbell narrow stance squat
  '69', // barbell overhead squat
])

/** Peso muerto convencional / sumo */
export const DEADLIFT_BENCHMARK_EXERCISE_IDS = new Set<string>([
  '32', // barbell deadlift
  '117', // barbell sumo deadlift
])

function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function nameLooksLikeBench(name: string): boolean {
  const n = normName(name)
  if (!n.includes('bench press')) return false
  if (
    n.includes('incline') ||
    n.includes('decline') ||
    n.includes('close-grip') ||
    n.includes('close grip') ||
    n.includes('jm bench')
  ) {
    return false
  }
  return true
}

function nameLooksLikeSquat(name: string): boolean {
  const n = normName(name)
  if (!n.includes('squat')) return false
  if (n.includes('bench')) return false
  if (n.includes('split') || n.includes('jump') || n.includes('sissy') || n.includes('bulgarian')) return false
  return (
    n.includes('barbell') || n.includes('front squat') || n.includes('full squat') || n.includes('hack squat')
  )
}

function nameLooksLikeDeadlift(name: string): boolean {
  const n = normName(name)
  if (!n.includes('deadlift')) return false
  if (n.includes('romanian') || n.includes('stiff')) return false
  if (n.includes('single leg')) return false
  return true
}

export type LiftBenchmarkKind = 'bench' | 'squat' | 'deadlift'

/**
 * Clasifica un PR para hitos de bench / squat / deadlift.
 * Prioriza coincidencia por exercise_id; si no aplica, usa nombre (denormalizado o catálogo).
 */
export function liftBenchmarkKind(
  exerciseId: string,
  exerciseName: string | null | undefined,
): LiftBenchmarkKind | null {
  if (BENCH_BENCHMARK_EXERCISE_IDS.has(exerciseId)) return 'bench'
  if (SQUAT_BENCHMARK_EXERCISE_IDS.has(exerciseId)) return 'squat'
  if (DEADLIFT_BENCHMARK_EXERCISE_IDS.has(exerciseId)) return 'deadlift'

  const name = exerciseName?.trim() ?? ''
  if (!name) return null
  if (nameLooksLikeBench(name)) return 'bench'
  if (nameLooksLikeSquat(name)) return 'squat'
  if (nameLooksLikeDeadlift(name)) return 'deadlift'
  return null
}
