import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function KpiTileSkeleton() {
  return (
    <Card className="min-w-0 overflow-visible border-muted/70 shadow-none">
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0">
        <Skeleton className="h-8 w-28 sm:h-9" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  )
}

export function AdminPaymentsSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container py-4">
          <Skeleton className="h-8 w-[min(100%,20rem)] sm:h-9" />
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <KpiTileSkeleton key={i} />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-full rounded-md sm:w-36" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden border-muted/70 shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
