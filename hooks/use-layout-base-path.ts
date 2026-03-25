'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Ruta bajo `/admin` o `/client` para marcar el ítem activo del sidebar.
 * `usePathname()` alinea mejor SSR e hidratación que `useSelectedLayoutSegments()` en Next 15+.
 */
export function useLayoutBasePath(prefix: '/admin' | '/client'): string {
  const pathname = usePathname()
  return useMemo(() => {
    if (!pathname) return prefix
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return pathname
    return prefix
  }, [pathname, prefix])
}
