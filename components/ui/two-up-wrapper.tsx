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
    <div className="relative w-full h-full group bg-neutral-950 overflow-hidden shadow-inner">
      <style jsx global>{`
        .img-comparison-slider {
          --divider-width: 1px;
          --divider-color: rgba(255, 255, 255, 0.4);
          --default-handle-width: 0; /* Removing default handle completely */
          width: 100%;
          height: 100%;
          cursor: col-resize;
          outline: none !important;
        }

        .img-comparison-slider:focus {
          outline: none;
        }

        /* Sublte glow for the divider line */
        .img-comparison-slider::part(divider) {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          background-image: linear-gradient(to bottom, transparent, white, transparent);
        }
      `}</style>

      <ImgComparisonSlider className="img-comparison-slider">
        {/* Child 1: Antes */}
        <div slot="first" className="relative w-full h-full select-none pointer-events-none">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.01]"
            loading="eager"
          />
          <div className="absolute top-6 left-6 z-10 transition-all duration-500 group-hover:translate-x-1">
             <span className="rounded-2xl bg-black/40 backdrop-blur-xl px-5 py-2 text-[10px] font-black text-white/90 uppercase tracking-[0.25em] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* Child 2: Después */}
        <div slot="second" className="relative w-full h-full select-none pointer-events-none">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.01]"
            loading="eager"
          />
          <div className="absolute top-6 right-6 z-10 transition-all duration-500 group-hover:-translate-x-1">
             <span className="rounded-2xl bg-primary/40 backdrop-blur-xl px-5 py-2 text-[10px] font-black text-white uppercase tracking-[0.25em] border border-primary/20 shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
              {afterLabel}
            </span>
          </div>
        </div>

        {/* --- ULTIMATE PREMIUM HANDLE --- */}
        <div slot="handle" className="z-30 cursor-col-resize -translate-x-1/2 flex items-center justify-center h-full">
           <div className="relative flex items-center justify-center">
              {/* Vertical Glowing Line */}
              <div className="w-[1px] h-[2000px] absolute bg-gradient-to-b from-transparent via-white/40 to-transparent pointer-events-none" />
              
              {/* Glassmorphism Circle */}
              <div className="size-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_12px_rgba(255,255,255,0.1)] flex items-center justify-center transition-all duration-300 hover:size-14 hover:bg-white/20 active:scale-90 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] overflow-hidden">
                  <div className="flex items-center gap-2.5 text-white/80">
                     <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 1L1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                     <div className="w-[1.5px] h-3 bg-white/30 rounded-full" />
                     <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                  
                  {/* Internal Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>
           </div>
        </div>
      </ImgComparisonSlider>
    </div>
  )
}
