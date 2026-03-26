import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientStackPageHeaderSkeleton } from '@/components/client/client-data-pages-skeleton'
import { CLIENT_DATA_PAGE_SHELL } from '@/components/client/client-app-page-parts'

/**
 * Placeholder genérico cliente: rail + contenido ancho en lg (consistente con el resto de vistas datos).
 */
export function ClientPageSkeleton() {
  return (
    <>
      <ClientStackPageHeaderSkeleton />
      <div className={CLIENT_DATA_PAGE_SHELL} aria-busy="true" aria-label="Cargando">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <Card className="border-border/80 shadow-sm ring-1 ring-primary/5">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </CardContent>
            </Card>
          </aside>
          <section className="min-w-0 lg:col-span-8">
            <Skeleton className="h-[min(320px,55vh)] w-full rounded-xl" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
