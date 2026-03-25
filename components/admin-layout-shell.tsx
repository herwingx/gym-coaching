'use client'

import { useSelectedLayoutSegments } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments()
  const isMessages = segments[0] === 'messages'

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className={cn(isMessages && 'min-h-0')}>
        {!isMessages ? (
          <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center border-b border-border bg-background px-4 sm:h-14 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1 size-9 sm:size-8" aria-label="Abrir menú" />
          </header>
        ) : null}
        <div
          id="main-content"
          role="main"
          tabIndex={-1}
          className={cn(
            'flex-1',
            isMessages ? 'flex min-h-0 flex-col overflow-hidden' : 'overflow-auto',
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
