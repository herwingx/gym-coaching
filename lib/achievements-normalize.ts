import type { Achievement, UserAchievement } from '@/lib/types'

const REQ_TYPES = new Set<Achievement['requirement_type']>([
  'sessions',
  'streak',
  'pr',
  'volume',
  'level',
  'messages',
  'early_workouts',
  'measurement_months',
  'lifetime_volume',
  'lift_bench_bw',
  'lift_squat_bw15',
  'lift_deadlift_bw2',
])

function asNonNegInt(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

/** Postgres / Supabase pueden devolver requirement_value como string; unifica a número. */
export function normalizeRequirementValue(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return asNonNegInt(raw)
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number.parseFloat(raw)
    if (Number.isFinite(n)) return asNonNegInt(n)
  }
  return 0
}

function normalizeXpReward(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? '0'))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

export function normalizeRequirementType(raw: unknown): Achievement['requirement_type'] | null {
  if (typeof raw !== 'string' || !REQ_TYPES.has(raw as Achievement['requirement_type'])) return null
  return raw as Achievement['requirement_type']
}

/** Mapper tolerante desde fila PostgREST / join anidado. */
export function normalizeAchievementFromDb(row: Record<string, unknown>): Achievement | null {
  const id = typeof row.id === 'string' ? row.id : null
  if (!id) return null

  const requirement_type = normalizeRequirementType(row.requirement_type)
  if (!requirement_type) return null

  const category = row.category
  if (
    typeof category !== 'string' ||
    !['strength', 'consistency', 'volume', 'milestone', 'special'].includes(category)
  ) {
    return null
  }

  const rarity = row.rarity
  const rarityNorm =
    typeof rarity === 'string' &&
    (rarity === 'common' || rarity === 'rare' || rarity === 'epic' || rarity === 'legendary')
      ? rarity
      : undefined

  const xp = normalizeXpReward(row.xp_reward)

  return {
    id,
    name: typeof row.name === 'string' ? row.name : '—',
    description: typeof row.description === 'string' ? row.description : undefined,
    icon: typeof row.icon === 'string' ? row.icon : 'trophy',
    xp_reward: xp,
    category: category as Achievement['category'],
    requirement_type,
    requirement_value: normalizeRequirementValue(row.requirement_value),
    created_at: typeof row.created_at === 'string' ? row.created_at : new Date(0).toISOString(),
    rarity: rarityNorm,
  }
}

export function normalizeAchievementList(rows: unknown): Achievement[] {
  if (!Array.isArray(rows)) return []
  const out: Achievement[] = []
  for (const r of rows) {
    if (r && typeof r === 'object') {
      const a = normalizeAchievementFromDb(r as Record<string, unknown>)
      if (a) out.push(a)
    }
  }
  return out
}

/** Normaliza `achievements` anidado en filas de user_achievements. */
export function normalizeUserAchievementsRows(rows: UserAchievement[] | null | undefined): UserAchievement[] {
  if (!rows?.length) return []
  return rows.map((ua) => {
    const nested = ua.achievements as Record<string, unknown> | undefined | null
    let achievements = ua.achievements
    if (nested && typeof nested === 'object') {
      const normalized = normalizeAchievementFromDb(nested)
      if (normalized) achievements = normalized
    }
    return { ...ua, achievements }
  })
}
