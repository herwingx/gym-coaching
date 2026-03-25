import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'
import { ClientStackPageHeaderSkeleton } from '@/components/client/client-data-pages-skeleton'

/** Estructura alineada con la tarjeta principal de Mis Rutinas (simetría 2 columnas en stats). */
export function ClientRoutinesPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div
        className={CLIENT_DATA_PAGE_SHELL}
        aria-busy="true"
        aria-label="Cargando rutinas"
      >
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-7 w-[min(100%,14rem)] sm:h-8" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-6 w-24 shrink-0 rounded-full sm:mt-1" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <Skeleton className="h-5 w-[min(100%,20rem)]" />
            <Skeleton className="mt-3 h-4 w-48" />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ejercicios de hoy
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/80 p-3"
                >
                  <Skeleton className="size-16 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
                    <Skeleton className="h-4 w-full max-w-[10rem]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-14 rounded-md" />
                      <Skeleton className="h-3 flex-1 max-w-[6rem]" />
                    </div>
                  </div>
                  <Skeleton className="size-4 shrink-0 rounded" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-5 h-11 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-6">
            <div className="flex flex-col items-center gap-2 text-center sm:items-stretch">
              <Skeleton className="mx-auto h-3 w-28 sm:mx-0" />
              <Skeleton className="mx-auto h-9 w-12 sm:mx-0" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center sm:items-stretch">
              <Skeleton className="mx-auto h-3 w-28 sm:mx-0" />
              <Skeleton className="mx-auto h-9 w-24 sm:mx-0" />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}
