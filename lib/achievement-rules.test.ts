import { describe, expect, it } from 'vitest'
import {
  BENCH_BENCHMARK_EXERCISE_IDS,
  DEADLIFT_BENCHMARK_EXERCISE_IDS,
  SQUAT_BENCHMARK_EXERCISE_IDS,
  liftBenchmarkKind,
} from '@/lib/achievement-rules'

describe('liftBenchmarkKind', () => {
  it('classifies by canonical exercise ids', () => {
    expect(liftBenchmarkKind('25', null)).toBe('bench')
    expect(SQUAT_BENCHMARK_EXERCISE_IDS.has('43')).toBe(true)
    expect(liftBenchmarkKind('43', null)).toBe('squat')
    expect(liftBenchmarkKind('32', null)).toBe('deadlift')
    expect(liftBenchmarkKind('117', null)).toBe('deadlift')
    expect(BENCH_BENCHMARK_EXERCISE_IDS.has('25')).toBe(true)
    expect(DEADLIFT_BENCHMARK_EXERCISE_IDS.has('32')).toBe(true)
  })

  it('returns null for unknown id without a matching name', () => {
    expect(liftBenchmarkKind('99999', null)).toBe(null)
    expect(liftBenchmarkKind('99999', '')).toBe(null)
  })

  it('falls back to English exercise names when id is unknown', () => {
    expect(liftBenchmarkKind('x', 'barbell bench press')).toBe('bench')
    expect(liftBenchmarkKind('x', 'Barbell Incline Bench Press')).toBe(null)
    expect(liftBenchmarkKind('x', 'barbell full squat')).toBe('squat')
    expect(liftBenchmarkKind('x', 'barbell deadlift')).toBe('deadlift')
    expect(liftBenchmarkKind('x', 'barbell romanian deadlift')).toBe(null)
  })
})
