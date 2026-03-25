import { describe, expect, it } from 'vitest'
import { longestConsecutiveMonthStreak } from '@/lib/achievement-month-streak'

describe('longestConsecutiveMonthStreak', () => {
  it('returns 0 for empty input', () => {
    expect(longestConsecutiveMonthStreak([])).toBe(0)
  })

  it('counts a single month as 1', () => {
    expect(longestConsecutiveMonthStreak(['2025-03'])).toBe(1)
  })

  it('dedupes duplicate month keys', () => {
    expect(longestConsecutiveMonthStreak(['2025-01', '2025-01', '2025-01'])).toBe(1)
  })

  it('finds longest consecutive run across year boundary', () => {
    expect(
      longestConsecutiveMonthStreak(['2024-11', '2024-12', '2025-01', '2025-02', '2025-05']),
    ).toBe(4)
  })

  it('picks the longer of two separate runs', () => {
    expect(
      longestConsecutiveMonthStreak(['2024-01', '2024-02', '2024-06', '2024-07', '2024-08']),
    ).toBe(3)
  })

  it('ignores malformed keys', () => {
    expect(longestConsecutiveMonthStreak(['2025-01', 'not-a-month', '2025-02'])).toBe(2)
  })
})
