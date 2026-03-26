import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors `app/admin/settings/page.tsx` layout (header, summary cards, tabs, form card). */
export function AdminSettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex flex-col gap-3 py-4 sm:py-5">
          <Skeleton className="h-8 w-44 sm:h-9 sm:w-56" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-dashed p-4"
              >
                <Skeleton className="size-9 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid h-10 w-full max-w-full grid-cols-2 gap-2 rounded-lg bg-muted p-1 sm:w-[240px]">
              <Skeleton className="h-full w-full rounded-md" />
              <Skeleton className="h-full w-full rounded-md" />
            </div>

            <div className="overflow-hidden rounded-xl border border-muted/60 shadow-sm">
              <div className="space-y-2 border-b px-5 py-4 sm:px-6 sm:py-5 sm:pb-3">
                <Skeleton className="h-6 w-52 sm:h-7" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>
              <div className="space-y-8 px-5 py-6 sm:px-6">
                <section className="space-y-4">
                  <Skeleton className="h-3 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-11 w-full rounded-md" />
                  </div>
                </section>
                <section className="space-y-4">
                  <Skeleton className="h-3 w-44" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                  </div>
                </section>
                <section className="space-y-4">
                  <Skeleton className="h-3 w-36" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-11 w-full rounded-md" />
                    </div>
                  </div>
                </section>
                <Skeleton className="h-11 w-full rounded-md sm:w-44" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
