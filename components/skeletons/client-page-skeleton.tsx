import { Skeleton } from '@/components/ui/skeleton'

/**
 * Generic client main-area placeholder (header comes from ClientLayoutShell).
 * Spacing matches `max-w-7xl` client pages (progress, measurements, etc.).
 */
export function ClientPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Cargando"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 sm:h-9 sm:w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  )
}
