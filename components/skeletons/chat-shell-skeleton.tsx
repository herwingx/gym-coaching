import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Inbox sidebar skeleton — admin only, hidden on mobile (thread shown instead).
 * Mirrors the real inbox aside: sticky header with logo placeholder + search + conversation rows.
 */
function InboxAsideSkeleton() {
  return (
    <aside
      className="hidden min-h-0 w-[min(100%,20rem)] shrink-0 flex-col border-r border-border bg-muted/20 md:flex"
      aria-hidden
    >
      {/* Header — matches AdminPageHeader structure */}
      <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex flex-col gap-2.5 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Sidebar trigger placeholder (md+) */}
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <Skeleton className="h-7 w-24" />
          </div>
          {/* Search bar */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </header>
      <ul className="flex-1 space-y-0 overflow-hidden" role="presentation">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li key={i} className="flex items-center gap-3 border-l-[3px] border-l-transparent px-4 py-3">
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

/**
 * Thread pane skeleton — messages area + composer.
 * Matches the real ThreadPane component header structure:
 * sticky header with container + leading icon + avatar + peer info.
 */
function ThreadPaneSkeleton({ variant }: { variant: 'admin' | 'client' }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-busy="true" aria-label="Cargando chat">
      {/* Thread header — matches consistent app header */}
      <header className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex items-center">
        <div className="w-full flex flex-row items-center gap-4 px-4 sm:px-6 md:px-8">
          {/* Back icon placeholder */}
          <Skeleton className="size-10 sm:size-11 shrink-0 rounded-full" />
          {/* Avatar + Peer info */}
          <div className="flex items-center gap-3 flex-1">
             <Skeleton className="size-10 sm:size-12 shrink-0 rounded-full" />
             <div className="min-w-0 flex flex-col gap-1.5">
               <Skeleton className="h-5 w-32 sm:w-48 rounded-lg" />
               <Skeleton className="h-3 w-20 rounded-md opacity-60" />
             </div>
          </div>
        </div>
      </header>

      {/* Messages area */}
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

      {/* Composer footer */}
      <footer className="shrink-0 border-t border-border bg-background safe-area-pb">
        <div className="container">
          <div className="mx-auto flex max-w-2xl flex-col gap-3 py-3">
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-36 shrink-0 rounded-full" />
              ))}
            </div>
            <div className="flex items-end gap-2">
              <Skeleton className="h-12 min-h-11 flex-1 rounded-2xl" />
              <Skeleton className="size-11 shrink-0 rounded-2xl" />
            </div>
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
      <ThreadPaneSkeleton variant={variant} />
    </div>
  )
}
