import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminDashboardSkeleton() {
  return (
    <div className="bg-background min-h-full">
      <header className="border-b bg-background">
        <div className="container py-4 sm:py-5">
          <div className="min-w-0">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8 @container/main">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Metric cards (4 cols) */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-16 mt-2" />
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 pt-0">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Chart card */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[250px] w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>

          {/* Tabs + filters */}
          <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md ml-auto" />
          </div>

          {/* Client cards grid */}
          <div className="grid gap-4 px-4 sm:grid-cols-2 lg:px-6 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
