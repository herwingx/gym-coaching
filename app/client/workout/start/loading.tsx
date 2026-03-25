import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors `WorkoutActiveSession`: sticky bar + progreso + bloque de ejercicio. */
export default function WorkoutStartLoading() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background"
      aria-busy="true"
      aria-label="Cargando entreno"
    >
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur safe-area-header-pt">
        <div className="container flex items-center justify-between py-3">
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 px-2 text-center">
            <Skeleton className="mx-auto h-3 w-28" />
            <Skeleton className="mx-auto mt-1 h-5 w-36 max-w-[70vw]" />
          </div>
          <Skeleton className="h-9 w-[5.5rem] shrink-0 rounded-md" />
        </div>
        <Skeleton className="h-1 w-full rounded-none" />
      </header>

      <main className="container flex-1 space-y-6 py-6">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="h-4 w-48 max-w-[55%]" />
          <Skeleton className="size-9 rounded-md" />
        </div>

        <div className="flex gap-4 rounded-2xl border bg-card p-4 shadow-sm">
          <Skeleton className="size-20 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-full max-w-[14rem]" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-[4.5rem] w-full rounded-xl" />
          <Skeleton className="h-[4.5rem] w-full rounded-xl" />
          <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        </div>
      </main>
    </div>
  )
}
