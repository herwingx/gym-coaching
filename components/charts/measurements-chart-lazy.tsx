'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

export const MeasurementsChartLazy = dynamic(
  () =>
    import('@/components/charts/measurements-chart').then((m) => ({
      default: m.MeasurementsChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  },
)
