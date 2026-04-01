import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function KpiTileSkeleton() {
  return (
    <Card className="min-w-0 overflow-visible border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4 p-6 pb-2">
        <Skeleton className="size-10 shrink-0 rounded-[1.2rem]" />
        <div className="ms-auto flex-1 text-right">
          <Skeleton className="ms-auto h-5 w-14 rounded-full opacity-60" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-6 pt-0">
        <Skeleton className="h-9 w-20 sm:h-10 sm:w-24 rounded-lg" />
        <Skeleton className="h-3.5 w-32 rounded-md opacity-40 uppercase tracking-widest" />
      </CardContent>
    </Card>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full h-full flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-4 h-full">
            <div className="shrink-0 flex items-center h-full">
              <Skeleton className="size-10 sm:size-11 rounded-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center py-1 sm:h-full gap-1.5">
              <Skeleton className="h-3.5 w-24 rounded-md opacity-40 uppercase tracking-[0.2em]" />
              <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-xl" />
              <Skeleton className="h-3.5 w-64 rounded-md opacity-60" />
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end shrink-0 sm:h-full">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-10 sm:h-11 w-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 lg:py-8">
        <div className="flex flex-1 flex-col gap-8 lg:gap-12">
          <section className="flex flex-col gap-6" aria-hidden>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <KpiTileSkeleton key={i} />
              ))}
            </div>

            <Card className="border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
              <CardHeader className="space-y-4 p-6 sm:p-8">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-96 max-w-full rounded-md opacity-40 uppercase tracking-widest" />
              </CardHeader>
              <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                <Skeleton className="h-[280px] w-full rounded-2xl" />
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="size-2 rounded-full bg-primary animate-pulse" />
                <Skeleton className="h-6 w-48 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full max-w-2xl rounded-md opacity-60" />
            </div>

            <Card className="border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm">
              <CardHeader className="flex flex-col gap-6 p-6 sm:p-8 sm:flex-row sm:items-start sm:justify-between border-b bg-muted/5">
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-3.5 w-full max-w-md rounded-md opacity-40 uppercase tracking-widest" />
                </div>
                <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-24 rounded-xl" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                  <Skeleton className="h-12 w-full rounded-2xl sm:w-60" />
                  <Skeleton className="h-12 w-full rounded-2xl sm:w-60" />
                  <Skeleton className="h-12 w-full rounded-2xl sm:w-48" />
                </div>
                <Skeleton className="h-4 w-32 rounded-md opacity-60 mt-2" />
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm transition-all hover:bg-card">
                  <CardHeader className="p-6 border-b bg-muted/5">
                    <div className="flex items-center gap-4">
                      <Skeleton className="size-12 shrink-0 rounded-2xl" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-5 w-36 rounded-md" />
                        <Skeleton className="h-3.5 w-24 rounded-md opacity-60" />
                      </div>
                      <Skeleton className="h-6 w-20 shrink-0 rounded-lg" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 p-6">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex items-center justify-between gap-4">
                        <Skeleton className="h-4 w-28 rounded-md opacity-60" />
                        <Skeleton className="h-4 w-16 rounded-md" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
