import { Skeleton } from '@/components/ui/skeleton'

/**
 * Generic admin route placeholder (settings, fallback admin segments).
 * Dashboard and other major screens use dedicated skeletons + route loading.tsx.
 */
export function AdminPageSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-8 w-48 sm:w-56" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-full max-w-xl rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="min-h-48 w-full rounded-xl" />
            <Skeleton className="min-h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </main>
    </div>
  )
}
