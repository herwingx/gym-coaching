'use client'

import dynamic from 'next/dynamic'
import { RoutineBuilderContentSkeleton } from '@/components/skeletons'
import type { RoutineBuilderClientProps } from './routine-builder-client'

const RoutineBuilderClientDynamic = dynamic(
  () => import('./routine-builder-client'),
  {
    ssr: false,
    loading: () => <RoutineBuilderContentSkeleton />,
  },
)

export function RoutineBuilderLazy(props: RoutineBuilderClientProps) {
  return <RoutineBuilderClientDynamic {...props} />
}
