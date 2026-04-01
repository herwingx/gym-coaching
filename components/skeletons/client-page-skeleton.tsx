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
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <aside className="flex flex-col gap-6 lg:col-span-4 lg:sticky lg:top-[max(1rem,env(safe-area-inset-top))] lg:self-start">
            <Card className="border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <Skeleton className="h-5 w-32 rounded-md" />
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-6 pb-6 pt-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-[120px] w-full rounded-2xl" />
              </CardContent>
            </Card>
          </aside>
          <section className="min-w-0 lg:col-span-8 flex flex-col gap-8">
            <Card className="overflow-hidden border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
               <Skeleton className="h-[min(320px,55vh)] w-full rounded-none" />
            </Card>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="p-6 border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
                 <Skeleton className="size-10 rounded-xl mb-4" />
                 <Skeleton className="h-5 w-32 rounded-md mb-2" />
                 <Skeleton className="h-3 w-48 rounded-md opacity-40" />
              </Card>
              <Card className="p-6 border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
                 <Skeleton className="size-10 rounded-xl mb-4" />
                 <Skeleton className="h-5 w-32 rounded-md mb-2" />
                 <Skeleton className="h-3 w-48 rounded-md opacity-40" />
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
