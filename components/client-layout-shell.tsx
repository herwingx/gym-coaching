'use client'

import { useSelectedLayoutSegments } from 'next/navigation'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ClientSidebar } from '@/components/client-sidebar'

export function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments()
  const isMessagesRoute = segments[0] === 'messages'

  return (
    <SidebarProvider defaultOpen={true}>
      <ClientSidebar />
      <SidebarInset>
        {!isMessagesRoute ? (
          <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center border-b border-border bg-background px-4 sm:h-14 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1 size-9 sm:size-8" aria-label="Abrir menú" />
          </header>
        ) : null}
        <div
          id="main-content"
          role="main"
          tabIndex={-1}
          className={
            isMessagesRoute
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
              : 'flex-1 overflow-auto'
          }
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
