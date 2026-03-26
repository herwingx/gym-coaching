import { describe, expect, it } from 'vitest'
import { calculate1RM } from './types'
import { isPR, isPRBeatingBaseline, suggestWeightForTargetReps } from './progression'

describe('progression helpers', () => {
  it('isPR returns true when no current PR', () => {
    expect(isPR(100, 5, null)).toBe(true)
  })

  it('isPR compares by estimated 1RM', () => {
    const current = { weight: 100, reps: 5, estimated_1rm: calculate1RM(100, 5) }
    expect(isPR(100, 6, current)).toBe(true)
    expect(isPR(95, 5, current)).toBe(false)
  })

  it('isPRBeatingBaseline: identical follow-up set in session is not a PR', () => {
    const first = { weight: 20, reps: 10, estimated_1rm: calculate1RM(20, 10) }
    expect(isPRBeatingBaseline(20, 10, null)).toBe(true)
    expect(isPRBeatingBaseline(20, 10, first)).toBe(false)
    expect(isPRBeatingBaseline(25, 10, first)).toBe(true)
  })

  it('suggestWeightForTargetReps uses estimated1RM when present', () => {
    const res = suggestWeightForTargetReps({
      estimated1RM: 120,
      targetReps: 10,
      incrementKg: 2.5,
      defaultWeightKg: 20,
    })
    expect(res.weight).toBeGreaterThan(0)
  })

  it('suggestWeightForTargetReps applies simple double progression', () => {
    const resUp = suggestWeightForTargetReps({
      lastWeight: 50,
      lastReps: 10,
      targetReps: 10,
      incrementKg: 2.5,
      defaultWeightKg: 20,
    })
    expect(resUp.weight).toBe(52.5)

    const resHold = suggestWeightForTargetReps({
      lastWeight: 50,
      lastReps: 8,
      targetReps: 10,
      incrementKg: 2.5,
      defaultWeightKg: 20,
    })
    expect(resHold.weight).toBe(50)
  })
})

