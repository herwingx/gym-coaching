import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'

export function ClientStackPageHeaderSkeleton() {
  return (
    <header className="border-b border-border" aria-hidden>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-28 rounded-md" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[min(100%,14rem)]" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
    </header>
  )
}

/** Historial de entrenos — lista + tarjeta principal */
export function ClientWorkoutsPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div className={CLIENT_DATA_PAGE_SHELL} aria-busy="true" aria-label="Cargando historial">
      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="flex flex-col gap-2 pb-4">
          <Skeleton className="h-6 w-48" />
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
      </div>
    </>
  )
}

/** Progreso — rejilla de gráficos + insights */
export function ClientProgressPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div className={CLIENT_DATA_PAGE_SHELL} aria-busy="true" aria-label="Cargando progreso">
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
      </div>
    </>
  )
}

/** Medidas — resumen + gráfico */
export function ClientMeasurementsPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div className={CLIENT_DATA_PAGE_SHELL} aria-busy="true" aria-label="Cargando medidas">
      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-border/80 shadow-sm ring-1 ring-primary/5">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full rounded-xl" />
        </CardContent>
      </Card>
      </div>
    </>
  )
}
