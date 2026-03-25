import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AchievementsLoading() {
  return (
    <div
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 pb-12"
      aria-busy="true"
      aria-label="Cargando progreso"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Skeleton className="h-9 w-[7.5rem] rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-[min(100%,20rem)] sm:h-9" />
            <Skeleton className="h-4 w-full max-w-prose" />
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4" aria-hidden>
        <Card className="overflow-hidden border-muted/70 shadow-none">
          <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="h-6 w-24 rounded-md" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-muted/60 bg-muted/15 shadow-none">
                  <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
                    <Skeleton className="size-9 shrink-0 rounded-lg" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="mb-1 h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4" aria-hidden>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-muted/70 shadow-none">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <Skeleton className="size-16 rounded-2xl" />
                <Skeleton className="h-4 w-full max-w-[12rem]" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2 overflow-hidden pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-muted/70 shadow-none">
              <CardHeader className="flex flex-row gap-4 pb-2">
                <Skeleton className="size-14 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
