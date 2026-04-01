import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function KpiTileSkeleton() {
  return (
    <Card className="min-w-0 overflow-visible border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4 p-6 pb-2">
        <Skeleton className="size-10 shrink-0 rounded-[1.2rem]" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-6 pt-0">
        <Skeleton className="h-9 w-28 sm:h-10 rounded-lg" />
        <Skeleton className="h-3.5 w-32 rounded-md opacity-40 uppercase tracking-widest mt-1" />
        <Skeleton className="h-3 w-40 rounded-md opacity-60" />
      </CardContent>
    </Card>
  )
}

export function AdminPaymentsSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full h-full flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-4 h-full">
            <div className="shrink-0 flex items-center h-full">
               <Skeleton className="size-10 sm:size-11 rounded-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center py-1 sm:h-full gap-1.5">
              <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-xl" />
              <Skeleton className="h-3.5 w-44 rounded-md opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <KpiTileSkeleton key={i} />
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-11 w-full rounded-2xl sm:w-40" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
                <CardHeader className="p-6 border-b bg-muted/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36 rounded-md" />
                      <Skeleton className="h-3.5 w-48 rounded-md opacity-60" />
                    </div>
                    <Skeleton className="h-6 w-20 shrink-0 rounded-lg" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-6">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-24 rounded-md opacity-60 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
