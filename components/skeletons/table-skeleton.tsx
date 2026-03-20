import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  showHeader?: boolean
}

export function TableSkeleton({ rows = 8, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      {showHeader && (
        <div className="border-b bg-muted/50 p-4 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      )}
      <div className="divide-y">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-40 shrink-0" />
            <Skeleton className="h-4 w-48 flex-1 min-w-0" />
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-8 w-8 rounded-md shrink-0 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
