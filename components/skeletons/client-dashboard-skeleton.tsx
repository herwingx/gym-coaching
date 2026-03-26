import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientStackPageHeaderSkeleton } from '@/components/client/client-data-pages-skeleton'
import { CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'

function ClientStatTileSkeleton() {
  return (
    <Card className="overflow-hidden border-muted/70 shadow-none">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="size-8 rounded-lg" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0">
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

/** Alineado con `ClientDashboardContent`: aside 4 cols (nivel + stats) · main 8 cols (gráfico, próximo, hitos). */
export function ClientDashboardSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div
        className={`${CLIENT_DATA_PAGE_SHELL} grid gap-6 lg:grid-cols-12`}
        aria-busy="true"
        aria-label="Cargando panel"
      >
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <Card className="overflow-hidden border-muted/70 shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Skeleton className="size-20 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ClientStatTileSkeleton key={i} />
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <Card className="border-muted/70 shadow-none">
            <CardHeader className="flex flex-col gap-1 pb-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[220px] w-full rounded-xl" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-muted/70 shadow-none">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-muted/70 bg-linear-to-br from-background to-muted/20 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="-mx-1 flex gap-5 overflow-hidden px-1 pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex min-w-[76px] flex-col items-center gap-2">
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
