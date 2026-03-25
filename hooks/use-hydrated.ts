'use client'

import { useEffect, useState } from 'react'

/**
 * `false` en SSR y en el primer render del cliente (coincide con el HTML).
 * `true` tras montar — úsalo solo cuando necesites diferir lógica al cliente
 * sin romper la hidratación.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}
