'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

export const MeasurementsRadarChartLazy = dynamic(
  () =>
    import('@/components/charts/measurements-radar-chart').then((m) => ({
      default: m.MeasurementsRadarChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-lg" />,
  },
)

