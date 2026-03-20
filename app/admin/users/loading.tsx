import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from '@/components/skeletons'

export default function UsersLoading() {
  return (
    <div className="bg-background min-h-full">
      <header className="border-b bg-background">
        <div className="container py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-56 mt-1" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <TableSkeleton rows={8} />
      </main>
    </div>
  )
}
