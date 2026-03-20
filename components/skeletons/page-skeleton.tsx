import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-2 w-24 rounded-full" />
      </div>
    </div>
  )
}
