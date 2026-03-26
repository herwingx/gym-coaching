import { calculate1RM } from './types'

interface SetHistory {
  weight: number
  reps: number
  rpe?: number
}

interface ProgressionSuggestion {
  weight: number
  reps: number
  reasoning: string
}

function roundToIncrement(value: number, increment: number) {
  if (!Number.isFinite(value)) return 0
  if (increment <= 0) return value
  return Math.round(value / increment) * increment
}

export function suggestWeightForTargetReps(args: {
  estimated1RM?: number | null
  lastWeight?: number | null
  lastReps?: number | null
  targetReps: number
  incrementKg?: number
  defaultWeightKg?: number
}): ProgressionSuggestion {
  const {
    estimated1RM,
    lastWeight,
    lastReps,
    targetReps,
    incrementKg = 2.5,
    defaultWeightKg = 20,
  } = args

  if (!targetReps || targetReps <= 0) {
    return { weight: defaultWeightKg, reps: targetReps, reasoning: 'Objetivo de reps inválido' }
  }

  if (estimated1RM && estimated1RM > 0) {
    const base = estimated1RM / (1 + targetReps / 30)
    const baseRounded = Math.max(roundToIncrement(base, incrementKg), 0)

    if (lastWeight && lastReps && lastWeight > 0) {
      if (lastReps >= targetReps) {
        return {
          weight: roundToIncrement(baseRounded + incrementKg, incrementKg),
          reps: targetReps,
          reasoning: 'Basado en tu e1RM y desempeño reciente: sube un poco',
        }
      }
      return {
        weight: baseRounded,
        reps: targetReps,
        reasoning: 'Basado en tu e1RM: mantén para completar reps objetivo',
      }
    }

    return { weight: baseRounded, reps: targetReps, reasoning: 'Basado en tu e1RM' }
  }

  if (lastWeight && lastReps && lastWeight > 0) {
    const next = lastReps >= targetReps ? lastWeight + incrementKg : lastWeight
    return {
      weight: Math.max(roundToIncrement(next, incrementKg), 0),
      reps: targetReps,
      reasoning: lastReps >= targetReps ? 'Completaste reps objetivo: sube un poco' : 'Mantén para completar reps objetivo',
    }
  }

  return { weight: defaultWeightKg, reps: targetReps, reasoning: 'Sin historial: peso inicial' }
}

/**
 * Calculates suggested weight for next set based on history and RPE
 * Uses a conservative progression model:
 * - If completed all reps with RPE < 7: suggest +2.5kg
 * - If RPE 7-8: maintain weight
 * - If RPE > 8 or failed reps: suggest -2.5kg
 */
export function suggestNextWeight(
  lastSets: SetHistory[],
  targetReps: number,
  defaultWeight: number = 20
): ProgressionSuggestion {
  if (lastSets.length === 0) {
    return {
      weight: defaultWeight,
      reps: targetReps,
      reasoning: 'Primera vez con este ejercicio'
    }
  }

  // Get the most recent complete set
  const lastSet = lastSets[0]
  
  // If no RPE recorded, use performance-based logic
  if (!lastSet.rpe) {
    if (lastSet.reps >= targetReps) {
      return {
        weight: lastSet.weight + 2.5,
        reps: targetReps,
        reasoning: 'Completaste todas las reps, intenta subir peso'
      }
    }
    return {
      weight: lastSet.weight,
      reps: targetReps,
      reasoning: 'Mantén el peso hasta completar todas las reps'
    }
  }

  // RPE-based progression
  if (lastSet.rpe < 7 && lastSet.reps >= targetReps) {
    return {
      weight: lastSet.weight + 2.5,
      reps: targetReps,
      reasoning: `RPE ${lastSet.rpe} - Puedes subir peso`
    }
  }
  
  if (lastSet.rpe >= 7 && lastSet.rpe <= 8) {
    return {
      weight: lastSet.weight,
      reps: targetReps,
      reasoning: `RPE ${lastSet.rpe} - Buen esfuerzo, mantén el peso`
    }
  }
  
  if (lastSet.rpe > 8 || lastSet.reps < targetReps) {
    return {
      weight: Math.max(lastSet.weight - 2.5, 0),
      reps: targetReps,
      reasoning: lastSet.reps < targetReps 
        ? 'No completaste las reps, baja un poco'
        : `RPE ${lastSet.rpe} muy alto, reduce el peso`
    }
  }

  return {
    weight: lastSet.weight,
    reps: targetReps,
    reasoning: 'Mantén el peso'
  }
}

/**
 * Calculates weekly volume for a muscle group
 */
export function calculateWeeklyVolume(
  logs: { weight: number; reps: number }[]
): number {
  return logs.reduce((total, log) => total + (log.weight * log.reps), 0)
}

/**
 * Estimates 1RM from a set using Epley formula
 */
export function estimateMax(weight: number, reps: number): number {
  return calculate1RM(weight, reps)
}

/** Best-known lift for PR comparisons (persisted or in-session). */
export type PRBaseline = { weight: number; reps: number; estimated_1rm: number }

/**
 * True if this set strictly beats the baseline e1RM, or if there is no baseline yet
 * (first recorded comparison in this chain).
 */
export function isPRBeatingBaseline(
  weight: number,
  reps: number,
  baseline: PRBaseline | null,
): boolean {
  const newEstimated1RM = calculate1RM(weight, reps)
  if (!baseline) return true
  return newEstimated1RM > baseline.estimated_1rm
}

/** Stronger of two baselines (by e1RM), or whichever is non-null. */
export function mergePRBaselines(a: PRBaseline | null, b: PRBaseline | null): PRBaseline | null {
  if (!a) return b
  if (!b) return a
  return a.estimated_1rm >= b.estimated_1rm ? a : b
}

export function prBaselineFromDbRow(
  row:
    | {
        weight_kg: number | null
        reps: number | null
        estimated_1rm: number | null
      }
    | undefined,
): PRBaseline | null {
  if (!row) return null
  const weight = Number(row.weight_kg ?? 0)
  const reps = Number(row.reps ?? 0)
  if (weight <= 0 || reps <= 0) return null
  let estimated_1rm = Number(row.estimated_1rm ?? 0)
  if (!Number.isFinite(estimated_1rm) || estimated_1rm <= 0) {
    estimated_1rm = calculate1RM(weight, reps)
  }
  return { weight, reps, estimated_1rm }
}

/**
 * Determines if a new PR was achieved (vs stored best only — no in-session dedupe).
 */
export function isPR(newWeight: number, newReps: number, currentPR: PRBaseline | null): boolean {
  return isPRBeatingBaseline(newWeight, newReps, currentPR)
}

/**
 * Calculates training volume metrics
 */
export function calculateVolumeMetrics(
  sets: { weight: number; reps: number; completed: boolean }[]
) {
  const completedSets = sets.filter(s => s.completed)
  
  return {
    totalVolume: completedSets.reduce((sum, s) => sum + (s.weight * s.reps), 0),
    totalSets: completedSets.length,
    totalReps: completedSets.reduce((sum, s) => sum + s.reps, 0),
    averageWeight: completedSets.length > 0 
      ? completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
      : 0
  }
}

/**
 * Generates progression recommendations based on recent performance
 */
export function generateProgressionPlan(
  recentSessions: { date: string; volume: number; prs: number }[],
  currentStreak: number
): {
  recommendation: 'deload' | 'maintain' | 'progress'
  message: string
} {
  // If less than 3 sessions, keep building
  if (recentSessions.length < 3) {
    return {
      recommendation: 'maintain',
      message: 'Sigue construyendo consistencia'
    }
  }

  const last3Volumes = recentSessions.slice(0, 3).map(s => s.volume)
  const avgVolume = last3Volumes.reduce((a, b) => a + b, 0) / 3
  const isVolumeDecreasing = last3Volumes[0] < avgVolume * 0.9

  // Deload week logic
  if (currentStreak >= 28 || (isVolumeDecreasing && currentStreak >= 14)) {
    return {
      recommendation: 'deload',
      message: 'Considera una semana de descarga para recuperarte'
    }
  }

  // Progress logic
  const recentPRs = recentSessions.slice(0, 3).reduce((sum, s) => sum + s.prs, 0)
  if (recentPRs > 0 && !isVolumeDecreasing) {
    return {
      recommendation: 'progress',
      message: 'Excelente progreso! Sigue subiendo'
    }
  }

  return {
    recommendation: 'maintain',
    message: 'Buen ritmo, mantén la consistencia'
  }
}
