'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

const ClientSidebar = dynamic(
  () => import('@/components/client-sidebar').then((m) => m.ClientSidebar),
  { ssr: false },
)

export function ClientLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessagesRoute = pathname.includes('/messages')

  return (
    <SidebarProvider defaultOpen={true} className="flex-1 min-h-0">
      <ClientSidebar />
      <SidebarInset className={isMessagesRoute ? 'min-h-0 flex-1' : ''}>
        <div
          id="main-content"
          role="main"
          tabIndex={-1}
          className={
            isMessagesRoute
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0'
              : 'flex-1 overflow-auto pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0'
          }
        >
          {children}
        </div>
        <MobileBottomNav type="client" />
      </SidebarInset>
    </SidebarProvider>
  )
}
