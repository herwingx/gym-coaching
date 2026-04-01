import { Skeleton } from '@/components/ui/skeleton'

/**
 * Generic admin route placeholder (settings, fallback admin segments).
 * Dashboard and other major screens use dedicated skeletons + route loading.tsx.
 */
export function AdminPageSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full h-full flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-4 h-full">
            <div className="shrink-0 flex items-center h-full">
               <Skeleton className="size-10 sm:size-11 rounded-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center py-1 sm:h-full gap-1.5">
              <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-xl" />
              <Skeleton className="h-3.5 w-full max-w-sm rounded-md opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-col gap-8">
          <Skeleton className="h-14 w-full max-w-xl rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="min-h-64 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 shadow-md">
               <Skeleton className="h-6 w-32 rounded-md mb-4" />
               <Skeleton className="h-4 w-full rounded-md opacity-40" />
            </div>
            <div className="min-h-64 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 shadow-md">
               <Skeleton className="h-6 w-32 rounded-md mb-4" />
               <Skeleton className="h-4 w-full rounded-md opacity-40" />
            </div>
          </div>
          <div className="h-48 rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 shadow-md">
             <Skeleton className="h-6 w-32 rounded-md mb-4" />
             <Skeleton className="h-4 w-full rounded-md opacity-40" />
          </div>
        </div>
      </main>
    </div>
  )
}
