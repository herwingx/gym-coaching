import { describe, expect, it } from 'vitest'
import {
  computeStrengthProgressInsight,
  computeVolumeInsightFromVolumes,
  median,
} from '@/lib/progress-insights'

describe('median', () => {
  it('handles odd length', () => {
    expect(median([3, 1, 2])).toBe(2)
  })
  it('handles even length', () => {
    expect(median([10, 20, 30, 40])).toBe(25)
  })
})

describe('computeVolumeInsightFromVolumes', () => {
  it('requires at least 6 sessions', () => {
    const r = computeVolumeInsightFromVolumes([1000, 1100, 1200, 1300, 1400])
    expect(r.status).toBe('insufficient')
  })

  it('detects upward trend with 8+ sessions using 4v4 median', () => {
    const vols = [1000, 1000, 1000, 1000, 1500, 1500, 1600, 1700]
    const r = computeVolumeInsightFromVolumes(vols)
    expect(r.status).toBe('ok')
    if (r.status === 'ok') {
      expect(r.window).toBe('4v4')
      expect(['up', 'stable']).toContain(r.direction)
      expect(r.direction).toBe('up')
    }
  })

  it('detects drop after strong prior block', () => {
    const vols = [8000, 8200, 8100, 8000, 4000, 3900, 4100, 4000]
    const r = computeVolumeInsightFromVolumes(vols)
    expect(r.status).toBe('ok')
    if (r.status === 'ok') {
      expect(r.direction).toBe('down')
    }
  })
})

describe('computeStrengthProgressInsight', () => {
  const now = new Date('2026-03-25T12:00:00')

  it('insufficient with few points', () => {
    const r = computeStrengthProgressInsight(
      [{ name: 'Press', points: [{ achieved_at: '2026-03-01', weight_kg: 40 }, { achieved_at: '2026-03-10', weight_kg: 42 }] }],
      now,
    )
    expect(r.status).toBe('insufficient')
  })

  it('picks clearest ramp using medians of thirds', () => {
    const pts = [
      { achieved_at: '2026-03-01', weight_kg: 40 },
      { achieved_at: '2026-03-02', weight_kg: 40 },
      { achieved_at: '2026-03-03', weight_kg: 41 },
      { achieved_at: '2026-03-15', weight_kg: 44 },
      { achieved_at: '2026-03-16', weight_kg: 45 },
      { achieved_at: '2026-03-20', weight_kg: 50 },
      { achieved_at: '2026-03-21', weight_kg: 51 },
    ]
    const r = computeStrengthProgressInsight(
      [
        { name: 'Press', points: pts },
        { name: 'Row', points: [{ achieved_at: '2026-03-01', weight_kg: 20 }, { achieved_at: '2026-03-02', weight_kg: 21 }] },
      ],
      now,
    )
    expect(r.status).toBe('ok')
    if (r.status === 'ok') {
      expect(r.exerciseName).toBe('Press')
      expect(r.deltaPct).toBeGreaterThan(1.25)
    }
  })
})
