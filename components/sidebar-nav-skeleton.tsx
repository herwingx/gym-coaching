import { Skeleton } from '@/components/ui/skeleton'
import { SidebarMenuItem } from '@/components/ui/sidebar'

/** Placeholder estable SSR/primer render: mismo número de filas que el menú real (evita mismatch Tooltip+Link). */
export function SidebarNavSkeleton({ rows }: { rows: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SidebarMenuItem key={`nav-skel-${i}`}>
          <div className="flex h-8 w-full items-center gap-2 rounded-md p-2" aria-hidden>
            <Skeleton className="size-4 shrink-0 rounded-md" />
            <Skeleton className="h-4 max-w-[85%] flex-1 rounded-md" />
          </div>
        </SidebarMenuItem>
      ))}
    </>
  )
}
