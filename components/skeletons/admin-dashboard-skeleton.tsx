import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function KpiTileSkeleton() {
  return (
    <Card className="min-w-0 overflow-visible border-muted/70 shadow-none">
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="ms-auto min-w-0 flex-1 text-right">
          <Skeleton className="ms-auto h-5 w-14 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0">
        <Skeleton className="h-8 w-16 sm:h-9" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex flex-col gap-1">
              <Skeleton className="h-3 w-36" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 shrink-0 rounded" />
                <Skeleton className="h-8 w-48 sm:h-9 sm:w-56" />
              </div>
              <Skeleton className="mt-0.5 h-4 w-full max-w-prose" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md sm:w-[9.5rem]" />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 lg:py-8">
        <div className="flex flex-1 flex-col gap-6 lg:gap-8">
          <section className="flex flex-col gap-4" aria-hidden>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <KpiTileSkeleton key={i} />
              ))}
            </div>

            <Card className="border-muted/70 shadow-none">
              <CardHeader className="space-y-1 p-4 pb-2 sm:p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-64" />
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
                <Skeleton className="h-[220px] w-full rounded-xl" />
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-5 w-36 sm:h-6" />
              </div>
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>

            <Card className="border-muted/70 shadow-none">
              <CardHeader className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-full max-w-sm" />
                </div>
                <div className="flex w-full flex-wrap gap-1 sm:w-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-[5.5rem] rounded-md sm:w-24" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-4 pt-0 sm:p-5 sm:pt-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <Skeleton className="h-11 w-full rounded-md sm:h-10 sm:w-[200px]" />
                  <Skeleton className="h-11 w-full rounded-md sm:h-10 sm:w-[200px]" />
                  <Skeleton className="h-11 w-full rounded-md sm:h-10 sm:w-40" />
                </div>
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-muted/70 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex items-center justify-between gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
