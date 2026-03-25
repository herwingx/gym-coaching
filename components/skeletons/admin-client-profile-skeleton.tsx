import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Mirrors `ClientProfileHub` + `app/admin/clients/[clientId]/page.tsx` shell (tabs + resumen). */
export function AdminClientProfileSkeleton() {
  return (
    <div className="min-h-dvh bg-background" aria-busy="true" aria-label="Cargando perfil">
      <header className="border-b bg-background">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Skeleton className="size-9 shrink-0 rounded-md sm:size-10" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
        </div>
      </header>

      <main className="container flex flex-col gap-8 py-8">
        <div className="flex flex-col gap-6">
          <div
            className="flex w-full max-w-full flex-wrap gap-2 rounded-lg border border-border/60 bg-muted/30 p-1.5"
            aria-hidden
          >
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-9 min-w-22 flex-1 rounded-md sm:flex-none sm:min-w-26" />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-muted/70 shadow-none">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-muted/70 shadow-none">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Skeleton className="size-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-xl" />
                  <Skeleton className="h-4 w-full max-w-lg" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
