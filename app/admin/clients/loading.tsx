import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function KpiTileSkeleton() {
  return (
    <Card className="min-w-0 overflow-visible border-muted/70 shadow-none">
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0">
        <Skeleton className="h-8 w-12 sm:h-9" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export default function AdminClientsLoading() {
  return (
    <div
      className="min-h-dvh bg-background"
      aria-busy="true"
      aria-label="Cargando asesorados"
    >
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full h-full flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-4 h-full">
            <div className="shrink-0 flex items-center h-full">
              <Skeleton className="size-10 sm:size-11 rounded-full" />
            </div>
            <div className="min-w-0 flex flex-col justify-center py-1 sm:h-full gap-1.5">
              <Skeleton className="h-7 sm:h-9 w-[min(100%,14rem)] rounded-xl" />
              <Skeleton className="h-3.5 w-40 max-w-full rounded-md opacity-60" />
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end shrink-0 sm:h-full">
             <Skeleton className="h-10 sm:h-11 w-full sm:w-[10rem] rounded-2xl" />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <KpiTileSkeleton key={i} />
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full max-w-sm rounded-md" />
            <div className="flex w-full flex-wrap gap-1 sm:w-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  className="h-9 flex-1 rounded-md sm:h-9 sm:w-20 sm:flex-none"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="overflow-hidden border-muted/70 shadow-none"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-12 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-full max-w-[12rem]" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
