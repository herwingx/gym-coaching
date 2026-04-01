'use client'

import * as React from 'react'
import 'two-up-element'

// Types for the custom element to fix linting in this file
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'two-up': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        orientation?: 'horizontal' | 'vertical';
      }, HTMLElement>;
    }
  }
}

interface TwoUpProps {
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
}: TwoUpProps) {
  const TwoUp = 'two-up' as any

  return (
    <>
      <style jsx global>{`
        two-up {
          display: block;
          width: 100% !important;
          height: 100% !important;
          cursor: col-resize;
          -webkit-user-select: none;
          user-select: none;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* Ensure two-up manages its internal layout correctly */
        two-up > * {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        /* Modern, premium handle styling */
        two-up::part(handle) {
          background: white;
          box-shadow: 
            0 0 0 4px rgba(255, 255, 255, 0.15),
            0 12px 32px rgba(0, 0, 0, 0.5),
            inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          border: 2px solid var(--primary, #3b82f6);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        two-up:hover::part(handle) {
          transform: scale(1.15);
        }

        two-up::part(bar) {
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent);
          width: 2.5px;
          opacity: 0.9;
        }

        /* Arrows inside the handle */
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
          left: 10px;
        }

        two-up::part(handle)::after {
          border-left: 6px solid var(--primary, #3b82f6);
          right: 10px;
        }

        @media (max-width: 640px) {
           two-up::part(handle) {
            width: 38px;
            height: 38px;
          }
           two-up::part(handle)::before { left: 8px; }
           two-up::part(handle)::after { right: 8px; }
        }
      `}</style>

      <TwoUp className="w-full h-full">
        {/* Lado A: Antes */}
        <div className="relative w-full h-full">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
          />
          <div className="absolute top-4 left-4 pointer-events-none z-10">
            <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-2xl">
              {beforeLabel}
            </span>
          </div>
        </div>

        {/* Lado B: Después */}
        <div className="relative w-full h-full">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
          />
          <div className="absolute top-4 right-4 pointer-events-none z-10">
            <span className="rounded-full bg-primary/90 backdrop-blur-lg px-3.5 py-1.5 text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 shadow-2xl">
              {afterLabel}
            </span>
          </div>
        </div>
      </TwoUp>
    </>
  )
}
