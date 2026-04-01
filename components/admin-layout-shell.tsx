'use client'

import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { cn } from '@/lib/utils'

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessages = pathname.includes('/messages')

  return (
    <SidebarProvider defaultOpen={true} className="flex-1 min-h-0">
      <AdminSidebar />
      <SidebarInset className={cn(isMessages && 'flex-1 min-h-0')}>
        <div
          id="main-content"
          role="main"
          tabIndex={-1}
          className={cn(
            'flex-1 pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0',
            isMessages ? 'flex min-h-0 flex-col overflow-hidden' : 'overflow-auto',
          )}
        >
          {children}
        </div>
        <MobileBottomNav type="admin" />
      </SidebarInset>
    </SidebarProvider>
  )
}
