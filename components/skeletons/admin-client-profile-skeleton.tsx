import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

/** Mirrors `ClientProfileHub` + `app/admin/clients/[clientId]/page.tsx` shell. */
export function AdminClientProfileSkeleton() {
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
              <Skeleton className="h-3.5 w-full max-w-md rounded-md opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <main className="container flex flex-col gap-8 py-8">
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando perfil">
      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-md border-b sm:static sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none">
        <ScrollArea className="w-full whitespace-nowrap pb-1">
          <div className="inline-flex min-w-full lg:w-auto bg-card/60 backdrop-blur-xl p-1 h-12 rounded-[1rem] border border-border/50 shadow-sm mb-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-lg mx-0.5" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      <div className="flex flex-col gap-6 pt-2">
        {/* Summary Grid: 4 cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl h-28"
            >
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-8 w-full max-w-[120px]" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content: 8/4 grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Skeleton className="size-[4rem] rounded-[1.2rem] shrink-0" />
                  <div className="flex flex-col gap-3 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Skeleton className="h-7 w-48 max-w-full" />
                      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-[280px]" />
                    <div className="mt-2 flex flex-col gap-2">
                      <Skeleton className="h-9 w-40 max-w-full rounded-lg" />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-24 rounded-full shrink-0" />
                      <Skeleton className="h-5 w-24 rounded-full shrink-0" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="h-full border-border/50 bg-card/60 backdrop-blur-xl rounded-[1.5rem] shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
  )
}
