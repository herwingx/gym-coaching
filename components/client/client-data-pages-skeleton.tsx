import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'

export function ClientStackPageHeaderSkeleton() {
  return (
    <header className="border-b border-border" aria-hidden>
      <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <Skeleton className="size-9 shrink-0 rounded-md sm:hidden" />
          <div className="min-w-0">
            <Skeleton className="h-7 w-[min(100%,14rem)] sm:h-8" />
            <Skeleton className="mt-2 h-4 w-full max-w-md" />
          </div>
        </div>
      </div>
    </header>
  )
}

/** Historial: lista principal primero en móvil; rail acciones a la izq. en lg (order como en página). */
export function ClientWorkoutsPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div
        className={`${CLIENT_DATA_PAGE_SHELL} flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start`}
        aria-busy="true"
        aria-label="Cargando historial"
      >
        <section className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:col-span-8">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="flex flex-col gap-2 pb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/15 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="order-2 lg:order-1 lg:col-span-4">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-full max-w-[12rem]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}

/** Progreso: gráficos primero en móvil; insights sticky rail en lg. */
export function ClientProgressPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div
        className={`${CLIENT_DATA_PAGE_SHELL} grid gap-6 lg:grid-cols-12 lg:items-start`}
        aria-busy="true"
        aria-label="Cargando progreso"
      >
        <aside className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-4">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-full max-w-sm" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </CardContent>
          </Card>
        </aside>

        <section className="order-1 flex min-w-0 flex-col gap-6 lg:order-2 lg:col-span-8">
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5 lg:col-span-2">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[220px] w-full rounded-xl" />
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5 lg:col-span-3">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[280px] w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  )
}

/** Medidas: resumen + CTA en aside; evolución en main. */
export function ClientMeasurementsPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div
        className={`${CLIENT_DATA_PAGE_SHELL} grid gap-6 lg:grid-cols-12 lg:items-start`}
        aria-busy="true"
        aria-label="Cargando medidas"
      >
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="flex flex-col gap-4 pb-4">
              <div className="flex items-start gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-full max-w-xs" />
                </div>
              </div>
              <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
            </CardHeader>
            <CardContent className="flex flex-col gap-6 border-t border-border/60 pt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-28" />
                  {i === 0 ? <Skeleton className="h-3 w-24" /> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 lg:col-span-8">
          <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[260px] w-full rounded-xl" />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
