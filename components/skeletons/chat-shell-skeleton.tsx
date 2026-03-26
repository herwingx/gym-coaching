import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function InboxAsideSkeleton() {
  return (
    <aside
      className="hidden min-h-0 w-[min(100%,20rem)] shrink-0 flex-col border-r border-border bg-muted/20 md:flex"
      aria-hidden
    >
      <div className="flex shrink-0 flex-col gap-3 border-b bg-background/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 shrink-0 rounded-md md:hidden" />
          <Skeleton className="size-4 shrink-0 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <ul className="flex-1 space-y-0 divide-y divide-border/60 p-2" role="presentation">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li key={i} className="flex items-center gap-3 px-2 py-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 max-w-40" />
              <Skeleton className="h-3 w-full max-w-48" />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function ThreadPaneSkeleton({ showAdminMobileChrome }: { showAdminMobileChrome?: boolean }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-busy="true" aria-label="Cargando chat">
      <header className="flex shrink-0 items-center gap-3 border-b bg-background/95 px-3 py-3 sm:px-4">
        {showAdminMobileChrome ? (
          <>
            <Skeleton className="size-9 shrink-0 rounded-md md:hidden" />
            <Skeleton className="size-9 shrink-0 rounded-md md:hidden" />
          </>
        ) : (
          <>
            <Skeleton className="size-9 shrink-0 rounded-md md:hidden" />
          </>
        )}
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-end bg-linear-to-b from-muted/15 to-background px-3 py-4 sm:px-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className={cn(
                'h-14 rounded-2xl',
                i % 2 === 0 ? 'ms-8 w-[85%]' : 'me-8 w-[75%]',
              )}
            />
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t bg-background safe-area-pb">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-3 py-3 sm:px-4">
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-36 shrink-0 rounded-full" />
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Skeleton className="h-12 min-h-11 flex-1 rounded-2xl" />
            <Skeleton className="size-11 shrink-0 rounded-2xl sm:size-12" />
          </div>
        </div>
      </footer>
    </section>
  )
}

export function ChatShellSkeleton({ variant }: { variant: 'admin' | 'client' }) {
  return (
    <div className="flex min-h-0 flex-1 bg-background">
      {variant === 'admin' ? <InboxAsideSkeleton /> : null}
      <ThreadPaneSkeleton showAdminMobileChrome={variant === 'admin'} />
    </div>
  )
}
