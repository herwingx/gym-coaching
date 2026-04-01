import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/skeletons";

export default function UsersLoading() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md safe-area-header-pt">
        <div className="container flex flex-col gap-3 py-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex flex-col gap-1.5">
              <Skeleton className="h-6 w-36 sm:h-7" />
              <Skeleton className="h-3.5 w-52 mt-0.5" />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <TableSkeleton rows={8} />
      </main>
    </div>
  );
}
