'use client'

import { useEffect, useState } from 'react'

/** `false` en SSR y primer render; `true` tras commit (seguro para marcar activo sin romper hidratación). */
export function useAfterMount(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}
