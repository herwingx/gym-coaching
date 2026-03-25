/**
 * Racha máxima de meses calendario consecutivos a partir de claves `YYYY-MM`.
 * Usado para el hito "Arquitecto del cuerpo" (medidas mes a mes).
 */
export function longestConsecutiveMonthStreak(monthKeys: string[]): number {
  const sorted = [...new Set(monthKeys)].sort()
  let best = 0
  let run = 0
  let prevYm: { y: number; m: number } | null = null

  for (const key of sorted) {
    const [yStr, mStr] = key.split('-')
    const y = Number(yStr)
    const m = Number(mStr)
    if (Number.isNaN(y) || Number.isNaN(m)) continue

    if (!prevYm) {
      run = 1
    } else {
      const nextYear: number = prevYm.m === 12 ? prevYm.y + 1 : prevYm.y
      const nextMonth: number = prevYm.m === 12 ? 1 : prevYm.m + 1
      if (y === nextYear && m === nextMonth) run++
      else run = 1
    }
    prevYm = { y, m }
    best = Math.max(best, run)
  }
  return best
}
