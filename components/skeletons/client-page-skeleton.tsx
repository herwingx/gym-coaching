import { Skeleton } from '@/components/ui/skeleton'

export function ClientPageSkeleton() {
  return (
    <div className="min-h-dvh w-full bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg shrink-0" />
            <div>
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}
