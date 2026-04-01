import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ReceptionistDashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full h-full flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 px-4 sm:px-6 md:px-8">
          <div className="min-w-0 flex flex-col justify-center">
            <Skeleton className="h-7 sm:h-9 w-48 sm:w-64 rounded-xl" />
            <Skeleton className="h-3.5 w-36 mt-1.5 rounded-md opacity-60" />
          </div>
          <Skeleton className="h-11 w-full sm:w-36 rounded-2xl" />
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-8 py-8">
        <div className="grid gap-8">
          {/* Welcome card */}
          <Card className="border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm p-2">
            <CardHeader className="p-6">
              <Skeleton className="h-7 w-56 rounded-xl" />
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md opacity-60" />
              </div>
            </CardContent>
          </Card>

          {/* Stats grid - 4 cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 pb-2 border-b bg-muted/5">
                  <Skeleton className="h-3.5 w-24 rounded-md opacity-40 uppercase tracking-widest" />
                </CardHeader>
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-16 mb-2 rounded-lg" />
                  <Skeleton className="h-3.5 w-32 rounded-md opacity-60" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <Card className="border-border/50 shadow-md ring-1 ring-primary/5 rounded-3xl bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-6 border-b bg-muted/5">
              <Skeleton className="h-6 w-44 rounded-lg" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
