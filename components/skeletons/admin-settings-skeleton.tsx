import { Skeleton } from '@/components/ui/skeleton'

export function AdminSettingsSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full h-full flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-4 h-full">
            <Skeleton className="size-10 sm:size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex flex-col justify-center py-1">
              <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-xl" />
              <Skeleton className="mt-1.5 h-3.5 w-full max-w-sm rounded-md opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-8 py-8 lg:py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-3xl border border-dashed border-border/60 p-6 bg-card/40"
              >
                <Skeleton className="size-10 shrink-0 rounded-[1.1rem]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md opacity-40 uppercase tracking-widest" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid h-12 w-full max-w-full grid-cols-2 gap-2 rounded-2xl bg-muted/30 p-1.5 sm:w-[320px]">
              <Skeleton className="h-full w-full rounded-xl" />
              <Skeleton className="h-full w-full rounded-xl" />
            </div>

            <div className="overflow-hidden border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
              <div className="space-y-3 border-b bg-muted/5 px-6 py-6 sm:px-8 sm:py-8">
                <Skeleton className="h-7 w-64 sm:h-8 rounded-xl" />
                <Skeleton className="h-4 w-full max-w-lg rounded-md opacity-60" />
              </div>
              <div className="space-y-10 px-6 py-8 sm:px-8">
                <section className="space-y-5">
                  <Skeleton className="h-3.5 w-40 rounded-md opacity-40 uppercase tracking-[0.15em]" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                  </div>
                </section>
                <section className="space-y-5">
                  <Skeleton className="h-3.5 w-44 rounded-md opacity-40 uppercase tracking-[0.15em]" />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                  </div>
                </section>
                <section className="space-y-5">
                  <Skeleton className="h-3.5 w-36 rounded-md opacity-40 uppercase tracking-[0.15em]" />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-28 rounded-md" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                  </div>
                </section>
                <Skeleton className="h-14 w-full rounded-2xl sm:w-48 shadow-lg shadow-primary/10" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
