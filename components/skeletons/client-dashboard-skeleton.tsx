import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientStackPageHeaderSkeleton } from '@/components/client/client-data-pages-skeleton'
import { CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'

function ClientStatTileSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm backdrop-blur-sm h-28">
      <Skeleton className="size-8 rounded-lg" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

/** Alineado con `ClientDashboardContent`: aside 4 cols · main 8 cols (XL breakpoints). */
export function ClientDashboardSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div
        className={`${CLIENT_DATA_PAGE_SHELL} grid gap-8 lg:grid-cols-12 pb-safe-area`}
        aria-busy="true"
        aria-label="Cargando panel"
      >
        <aside className="flex flex-col gap-8 lg:col-span-12 xl:col-span-4">
          {/* Level Progress Skeleton */}
          <Card className="overflow-hidden border-border/80 shadow-md rounded-3xl bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Skeleton className="size-20 shrink-0 rounded-[1.2rem]" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ClientStatTileSkeleton key={i} />
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-8 lg:col-span-12 xl:col-span-8">
          {/* Analysis Chart Skeleton */}
          <Card className="overflow-hidden border-border/80 shadow-md rounded-3xl bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-6 px-6 sm:px-8">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 pb-6">
              <Skeleton className="h-[220px] w-full rounded-2xl" />
            </CardContent>
          </Card>

          {/* Next Workout Skeleton */}
          <Card className="overflow-hidden border-border/80 shadow-md rounded-3xl bg-card/60 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                   <Skeleton className="h-5 w-40" />
                   <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements Skeleton */}
          <Card className="overflow-hidden border-border/80 shadow-md rounded-3xl bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                   <Skeleton className="size-5 rounded-full" />
                   <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-6">
              <div className="flex gap-6 overflow-hidden pb-4 pt-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex min-w-[84px] flex-col items-center gap-3">
                    <Skeleton className="size-14 shrink-0 rounded-2xl" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
