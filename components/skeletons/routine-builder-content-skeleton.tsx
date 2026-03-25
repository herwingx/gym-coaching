import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

function DayCardSkeleton({ rest = false }: { rest?: boolean }) {
  return (
    <div
      className={
        rest
          ? 'overflow-hidden rounded-xl border border-dashed border-muted-foreground/25 bg-muted/15 shadow-sm'
          : 'overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      <div className="flex flex-col gap-4 px-5 pb-4 pt-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-28 sm:w-36" />
              <Skeleton className="h-3 w-full max-w-xs sm:h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
            <Skeleton className="size-5 shrink-0 rounded-full sm:h-6 sm:w-10" />
            <Skeleton className="h-4 w-28 sm:h-4 sm:w-32" />
          </div>
        </div>
      </div>
      {!rest && (
        <div className="flex flex-col gap-4 px-5 pb-6 pt-0 sm:px-6">
          <Skeleton className="min-h-[72px] w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      )}
    </div>
  )
}

/**
 * Inner layout for routine builder (`RoutineBuilderClient`), shared by route `loading.tsx` and dynamic import fallback.
 */
export function RoutineBuilderContentSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-28 lg:pb-10"
      aria-busy="true"
      aria-label="Cargando constructor"
    >
      <div className="rounded-lg border border-primary/20 bg-muted/20 p-4 sm:p-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3.5 w-full max-w-2xl" />
          <Skeleton className="h-3.5 w-full max-w-xl" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="flex gap-3 px-6 pb-2 pt-6">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-5 w-44 sm:h-6 sm:w-52" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
        <div className="flex flex-col gap-6 px-6 pb-6 pt-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="space-y-2 md:col-span-8">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2 md:col-span-12">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="min-h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 sm:h-6 sm:w-44" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-7 w-44 rounded-full" />
        </div>

        <Separator />

        <div className="flex flex-col gap-5">
          <DayCardSkeleton />
          <DayCardSkeleton rest />
          <DayCardSkeleton />
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95',
          'px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6',
          'lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none',
        )}
        aria-hidden
      >
        <div className="mx-auto w-full max-w-3xl lg:max-w-none">
          <Skeleton className="h-12 w-full rounded-xl sm:h-11" />
        </div>
      </div>
    </div>
  )
}
