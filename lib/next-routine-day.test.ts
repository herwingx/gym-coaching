import { describe, expect, it } from 'vitest'
import { getNextRoutineDay, getNextRoutineDayIndex, sortRoutineDaysByDayNumber } from './next-routine-day'

const ex = [{ id: 're' }]

function days7WithSatRest() {
  return sortRoutineDaysByDayNumber([
    { id: 'd1', day_number: 1, is_rest_day: false, routine_exercises: ex },
    { id: 'd2', day_number: 2, is_rest_day: false, routine_exercises: ex },
    { id: 'd3', day_number: 3, is_rest_day: false, routine_exercises: ex },
    { id: 'd4', day_number: 4, is_rest_day: false, routine_exercises: ex },
    { id: 'd5', day_number: 5, is_rest_day: false, routine_exercises: ex },
    { id: 'd6', day_number: 6, is_rest_day: true, routine_exercises: [] },
    { id: 'd7', day_number: 7, is_rest_day: false, routine_exercises: ex },
  ])
}

describe('next-routine-day', () => {
  it('after last training day before a rest block, skips rest to next trainable', () => {
    const sorted = days7WithSatRest()
    const idx = getNextRoutineDayIndex(sorted, 'd5')
    expect(idx).toBe(sorted.findIndex((d) => d.id === 'd7'))
    const next = getNextRoutineDay(sorted, 'd5')
    expect(next?.id).toBe('d7')
  })

  it('first session uses first trainable day when day 1 is rest', () => {
    const sorted = sortRoutineDaysByDayNumber([
      { id: 'r1', day_number: 1, is_rest_day: true, routine_exercises: [] },
      { id: 't2', day_number: 2, is_rest_day: false, routine_exercises: ex },
    ])
    expect(getNextRoutineDayIndex(sorted, null)).toBe(1)
    expect(getNextRoutineDay(sorted, null)?.id).toBe('t2')
  })

  it('returns null when every block is rest or has no exercises', () => {
    const sorted = sortRoutineDaysByDayNumber([
      { id: 'a', day_number: 1, is_rest_day: true, routine_exercises: [] },
      { id: 'b', day_number: 2, is_rest_day: true, routine_exercises: [] },
    ])
    expect(getNextRoutineDayIndex(sorted, null)).toBe(null)
    expect(getNextRoutineDay(sorted, null)).toBe(null)
  })

  it('wraps cycle and still skips rest', () => {
    const sorted = days7WithSatRest()
    const idx = getNextRoutineDayIndex(sorted, 'd7')
    expect(sorted[idx!]?.id).toBe('d1')
  })
})
