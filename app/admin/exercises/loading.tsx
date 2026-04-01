import { Skeleton } from "@/components/ui/skeleton";
import { AdminExercisesCatalogSkeleton } from "@/components/admin/exercises/admin-exercises-catalog-skeleton";

export default function AdminExercisesLoading() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex flex-col gap-1.5">
              <Skeleton className="h-6 w-48 sm:h-7 sm:w-56" />
              <Skeleton className="h-3.5 w-full max-w-xs" />
            </div>
          </div>
          <Skeleton className="h-9 w-full rounded-xl sm:w-36" />
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <AdminExercisesCatalogSkeleton />
      </main>
    </div>
  );
}
