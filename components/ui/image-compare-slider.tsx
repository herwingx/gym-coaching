'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// We wrap the two-up element in a client-only component to avoid SSR errors
const TwoUpInternal = dynamic(
  () => import('./two-up-wrapper'),
  { 
    ssr: false, 
    loading: () => <TwoUpSkeleton /> 
  }
)

function TwoUpSkeleton() {
  return (
    <div className="relative w-full aspect-[3/4] md:aspect-video bg-muted/20 animate-pulse rounded-3xl overflow-hidden flex items-center justify-center">
      <div className="text-muted-foreground/30 text-xs font-bold uppercase tracking-[0.25em]">
        Iniciando...
      </div>
    </div>
  )
}

export interface ImageCompareSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function ImageCompareSlider(props: ImageCompareSliderProps) {
  return (
    <div className={cn('relative group overflow-hidden rounded-3xl border bg-card shadow-2xl transition-all duration-500 hover:shadow-primary/5', props.className)}>
       <TwoUpInternal {...props} />
    </div>
  )
}
