import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationsLoading() {
  return (
    <div
      className="min-h-full bg-background"
      aria-busy="true"
      aria-label="Cargando invitaciones"
    >
      <header className="sticky top-0 z-40 border-b bg-background safe-area-pt">
        <div className="container space-y-2 py-4 sm:py-5">
          <Skeleton className="h-8 w-64 sm:h-9 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </header>

      <main className="container flex flex-col gap-6 py-6 sm:py-8">
        <Card className="border-muted/70 shadow-none">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-11 w-full rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
            <Skeleton className="h-11 w-full max-w-xs rounded-md sm:w-48" />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="overflow-hidden border-muted/70 shadow-none"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-6 w-24 font-mono" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
