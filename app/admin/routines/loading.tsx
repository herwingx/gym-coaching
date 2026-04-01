import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function KpiTileSkeleton() {
  return (
    <Card className="min-w-0 overflow-visible border-muted/70 shadow-none">
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 p-4 pt-0">
        <Skeleton className="h-8 w-16 sm:h-9" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function AdminRoutinesLoading() {
  return (
    <div
      className="min-h-dvh bg-background"
      aria-busy="true"
      aria-label="Cargando rutinas"
    >
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex flex-col gap-1.5">
              <Skeleton className="h-6 w-[min(100%,14rem)] sm:h-7" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-full rounded-xl sm:w-auto sm:min-w-[10rem]" />
        </div>
      </header>

      <main className="container min-w-0 py-8">
        <section className="mb-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <KpiTileSkeleton key={i} />
          ))}
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="overflow-hidden border-muted/70 shadow-none"
            >
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="size-9 shrink-0 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full max-w-xs" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
