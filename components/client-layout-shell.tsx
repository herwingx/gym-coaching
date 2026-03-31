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
