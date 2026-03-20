import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ReceptionistDashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="min-w-0">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36 mt-1" />
          </div>
          <Skeleton className="h-9 w-full sm:w-28 rounded-md" />
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6">
          {/* Welcome card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>

          {/* Stats grid - 4 cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
