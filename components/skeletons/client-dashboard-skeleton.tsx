import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ClientDashboardSkeleton() {
  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm safe-area-header-pt">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 space-y-6 sm:px-6 lg:px-8 @container/main">
        {/* Level progress card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="size-20 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats cards (4 cols) */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart card */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Next workout card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick actions grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  )
}
