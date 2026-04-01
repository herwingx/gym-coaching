import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationsLoading() {
  return (
    <div
      className="min-h-dvh bg-background"
      aria-busy="true"
      aria-label="Cargando invitaciones"
    >
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex flex-col gap-1.5">
              <Skeleton className="h-6 w-56 sm:h-7 sm:w-64" />
              <Skeleton className="h-3.5 w-full max-w-xs" />
            </div>
          </div>
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
