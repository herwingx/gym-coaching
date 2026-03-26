/** Mes (1–12 en URL) para pantallas cliente: rutas /calendar y /client/workouts. */

export function clampMonthYear(y: number, m1: number) {
  const now = new Date()
  const year = Number.isFinite(y) && y >= 2020 && y <= 2100 ? y : now.getFullYear()
  let monthIndex = m1 - 1
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    monthIndex = now.getMonth()
  }
  return { year, monthIndex }
}

export function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1)
  return { year: d.getFullYear(), monthIndex: d.getMonth() }
}

export function workoutsMonthHref(year: number, monthIndex: number) {
  return `/client/workouts?y=${year}&m=${monthIndex + 1}`
}
