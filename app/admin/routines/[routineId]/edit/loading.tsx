import { Skeleton } from "@/components/ui/skeleton";
import { RoutineBuilderContentSkeleton } from "@/components/skeletons";

export default function EditRoutineLoading() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Skeleton className="size-9 shrink-0 rounded-md sm:size-10" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-48 sm:h-8 sm:w-56" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </header>
      <main className="container py-8">
        <RoutineBuilderContentSkeleton />
      </main>
    </div>
  );
}
