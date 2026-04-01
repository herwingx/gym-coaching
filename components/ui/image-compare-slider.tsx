'use client'

import * as React from 'react'
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
  beforeLabel = 'Antes',
  afterLabel = 'Después',
  className,
}: ImageCompareSliderProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    // Import the custom element on the client side only
    import('two-up-element').then(() => {
      setIsLoaded(true)
    })
  }, [])

  if (!isLoaded) {
    return (
      <div className={cn('relative w-full bg-muted/20 animate-pulse rounded-3xl overflow-hidden aspect-[3/4] md:aspect-video', className)}>
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs font-bold uppercase tracking-[0.25em]">
           Cargando...
        </div>
      </div>
    )
  }

  // Use a local constant for the custom element tag to avoid JSX intrinsic elements types issues
  const TwoUp = 'two-up' as any

  return (
    <div className={cn('group relative overflow-hidden rounded-3xl border bg-card shadow-2xl transition-all duration-500 hover:shadow-primary/5', className)}>
      <style jsx global>{`
        two-up {
          --thumb-background: white;
          --thumb-size: 40px;
          --bar-background: white;
          --bar-size: 2px;
          display: block;
          width: 100%;
          height: 100%;
          cursor: col-resize;
          -webkit-user-select: none;
          user-select: none;
        }

        /* Modern, premium handle styling */
        two-up::part(handle) {
          background: white;
          box-shadow: 
            0 0 0 4px rgba(255, 255, 255, 0.1),
            0 8px 24px rgba(0, 0, 0, 0.4),
            inset 0 0 0 1px rgba(0, 0, 0, 0.1);
          border: 2.5px solid var(--primary, #3b82f6);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
        }

        two-up:hover::part(handle) {
          transform: scale(1.1);
          box-shadow: 
            0 0 0 6px rgba(255, 255, 255, 0.15),
            0 12px 32px rgba(0, 0, 0, 0.5),
            inset 0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        /* Arrows for the handle */
        two-up::part(handle)::before,
        two-up::part(handle)::after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
        }

        two-up::part(handle)::before {
          border-right: 6px solid var(--primary, #3b82f6);
          left: 8px;
        }

        two-up::part(handle)::after {
          border-left: 6px solid var(--primary, #3b82f6);
          right: 8px;
        }

        two-up::part(bar) {
          background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%);
          width: 2px;
          opacity: 0.8;
        }

        @media (max-width: 640px) {
          two-up::part(handle) {
            width: 36px;
            height: 36px;
          }
           two-up::part(handle)::before { left: 6px; }
           two-up::part(handle)::after { right: 6px; }
        }
      `}</style>

      <TwoUp className="w-full h-full">
        <div className="relative h-full w-full bg-muted/10 flex items-center justify-center">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="h-full w-full object-cover select-none transition-transform duration-700 hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 pointer-events-none transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-black/60 backdrop-blur-md px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-[0.15em] border border-white/20 shadow-xl">
              {beforeLabel}
            </span>
          </div>
        </div>
        <div className="relative h-full w-full bg-muted/10 flex items-center justify-center">
          <img
            src={afterImage}
            alt={afterLabel}
            className="h-full w-full object-cover select-none transition-transform duration-700 hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute top-4 right-4 pointer-events-none transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-primary/80 backdrop-blur-md px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-[0.15em] border border-white/20 shadow-xl">
              {afterLabel}
            </span>
          </div>
        </div>
      </TwoUp>
    </div>
  )
}
