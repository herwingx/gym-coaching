'use client'

import * as React from 'react'
import { ImgComparisonSlider } from '@img-comparison-slider/react'
import { cn } from '@/lib/utils'

interface ImageCompareProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export default function TwoUpWrapper({
  beforeImage,
  afterImage,
  beforeLabel = 'Antes',
  afterLabel = 'Después'
}: ImageCompareProps) {
  return (
    <div className="relative w-full h-full group bg-black overflow-hidden">
      <style jsx global>{`
        .img-comparison-slider {
          --divider-width: 2px;
          --divider-color: white;
          --default-handle-width: 44px;
          --default-handle-color: white;
          --divider-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
          width: 100%;
          height: 100%;
          cursor: col-resize;
          border-radius: inherit;
        }

        .img-comparison-slider:focus {
           outline: none;
        }

        /* Essential for full height */
        .img-comparison-slider > [slot="before"],
        .img-comparison-slider > [slot="after"] {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>

      <ImgComparisonSlider className="img-comparison-slider">
        {/* Child 1: Antes */}
        <div slot="first" className="relative w-full h-full overflow-hidden">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover select-none"
            loading="eager"
          />
          <div className="absolute top-4 left-4 pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-100">
             <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-2xl">
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* Child 2: Después */}
        <div slot="second" className="relative w-full h-full overflow-hidden">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover select-none"
            loading="eager"
          />
          <div className="absolute top-4 right-4 pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-100">
             <span className="rounded-full bg-primary/90 backdrop-blur-lg px-3.5 py-1.5 text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-2xl">
              {afterLabel}
            </span>
          </div>
        </div>

        {/* Custom Handle Override for Premium Look */}
        <div slot="handle" className="z-20 cursor-col-resize">
          <div className="flex flex-col items-center justify-center -translate-x-1/2">
             <div className="w-[3px] h-[500%] absolute bg-white/80 shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
             <div className="size-11 rounded-full bg-white shadow-2xl border-[3px] border-primary flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                 <div className="flex gap-1">
                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <div className="size-1.5 rounded-full bg-primary/60 scale-75" />
                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                 </div>
             </div>
          </div>
        </div>
      </ImgComparisonSlider>
    </div>
  )
}
