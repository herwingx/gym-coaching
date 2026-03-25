'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

export const VolumeChartLazy = dynamic(
  () =>
    import('@/components/charts/volume-chart').then((m) => ({ default: m.VolumeChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  },
)

export const ExerciseProgressChartLazy = dynamic(
  () =>
    import('@/components/charts/exercise-progress-chart').then((m) => ({
      default: m.ExerciseProgressChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-lg" />,
  },
)
