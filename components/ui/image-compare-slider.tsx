'use client'

import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export interface ImageCompareSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function ImageCompareSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  className,
}: ImageCompareSliderProps) {
  const [position, setPosition] = React.useState(50)

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted aspect-[4/3]', className)}>
      {/* Imagen "después" (fondo) */}
      <img
        src={afterImage}
        alt={afterLabel ?? 'Después'}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Imagen "antes" (superpuesta, recortada por la izquierda) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel ?? 'Antes'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Línea divisoria */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 rounded-full bg-white shadow-md border-2 border-muted flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M8 3v18" />
            <path d="m12 15 4 4 4-4" />
            <path d="m12 9 4-4 4 4" />
          </svg>
        </div>
      </div>

      {/* Slider */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <Slider
          value={[position]}
          onValueChange={([v]) => setPosition(v)}
          min={0}
          max={100}
          step={1}
          className="cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Labels */}
      {(beforeLabel || afterLabel) && (
        <div className="absolute top-3 left-0 right-0 flex justify-between px-4 pointer-events-none">
          <span className="rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {beforeLabel ?? 'Antes'}
          </span>
          <span className="rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {afterLabel ?? 'Después'}
          </span>
        </div>
      )}
    </div>
  )
}
