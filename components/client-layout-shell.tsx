'use client'

import dynamic from 'next/dynamic'
import { useSelectedLayoutSegments } from 'next/navigation'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

const ClientSidebar = dynamic(
  () => import('@/components/client-sidebar').then((m) => m.ClientSidebar),
  { ssr: false },
)

export function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments()
  const isMessagesRoute = segments[0] === 'messages'

  return (
    <SidebarProvider defaultOpen={true}>
      <ClientSidebar />
      <SidebarInset>
        {!isMessagesRoute ? (
          <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sm:h-14 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1 size-9 sm:size-8" aria-label="Abrir menú" />
            <div className="flex items-center gap-2 lg:hidden">
              <div className="size-7 rounded-lg overflow-hidden ring-1 ring-border">
                <img src="/android-chrome-192x192.png" alt="Logo" className="size-full object-cover" />
              </div>
              <span className="text-sm font-bold tracking-tight">GymCoach</span>
            </div>
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
