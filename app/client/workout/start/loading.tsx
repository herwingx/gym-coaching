import { Skeleton } from "@/components/ui/skeleton";

/** Alineado con `WorkoutActiveSession`: cabecera con timer + Terminar, grid lg 5+7, carrusel, hero, tabla de series. */
export default function WorkoutStartLoading() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background"
      aria-busy="true"
      aria-label="Cargando entreno"
    >
      <header className="safe-area-header-pt sticky top-0 z-40 border-b border-border bg-background">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 sm:flex-initial">
              <Skeleton className="h-5 w-[min(100%,12rem)] sm:h-6" />
              <Skeleton className="mt-1 h-3 w-32 max-w-full sm:w-40" />
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <Skeleton className="h-10 min-w-[5.5rem] rounded-full" />
            <Skeleton className="h-10 w-[5.5rem] shrink-0 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-1 w-full rounded-none" />
      </header>

      <main className="container min-w-0 flex-1 py-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="size-11 shrink-0 rounded-md" />
              <Skeleton className="h-3 w-40 max-w-[45%]" />
              <Skeleton className="size-11 shrink-0 rounded-md" />
            </div>

            <div className="-mx-1 flex gap-2 overflow-hidden px-1 pb-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex shrink-0 flex-col items-center gap-1"
                >
                  <Skeleton className="size-14 rounded-full sm:size-16" />
                  <Skeleton className="h-2 w-4" />
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
              <Skeleton className="aspect-4/3 w-full rounded-none" />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 p-3">
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>

            <Skeleton className="min-h-18 w-full rounded-md" />
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:col-span-7 lg:self-start lg:pt-1">
            <div className="space-y-2">
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-48" />
            </div>

            <Skeleton className="h-3 w-full max-w-xl" aria-hidden />

            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  className="h-[4.5rem] w-full rounded-xl sm:h-24"
                />
              ))}
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
