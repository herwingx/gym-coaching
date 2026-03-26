import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton alineado al layout del catálogo: panel de filtros + rejilla desktop. */
export function AdminExercisesCatalogSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-[max(6.5rem,env(safe-area-inset-top,0px))] lg:col-span-4 lg:self-start xl:col-span-3">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/15 p-4 ring-1 ring-primary/5">
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="hidden h-4 w-48 lg:block" />
      </aside>

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 xl:col-span-9">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="hidden h-9 w-28 rounded-md sm:block" />
        </div>

        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3"
          role="presentation"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card ring-1 ring-primary/5"
            >
              <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-none rounded-t-xl" />
              <div className="flex flex-col gap-2 p-3">
                <Skeleton className="h-5 w-[85%] max-w-[14rem]" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="mt-1 h-9 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
