import { Skeleton } from '@/components/ui/skeleton'
import { AdminExercisesCatalogSkeleton } from '@/components/admin/exercises/admin-exercises-catalog-skeleton'

export default function AdminExercisesLoading() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-8 w-56 sm:h-9 sm:w-64" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-md sm:w-40" />
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <AdminExercisesCatalogSkeleton />
      </main>
    </div>
  )
}
