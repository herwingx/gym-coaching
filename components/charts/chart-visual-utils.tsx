'use client'

import * as React from 'react'

/** Sombra suave bajo la serie (compatible con tema claro/oscuro). */
export function ChartAreaShadowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" />
    </filter>
  )
}

export function useChartShadowFilterId(prefix: string): string {
  const raw = React.useId().replace(/:/g, '')
  return `${prefix}-${raw}`
}
