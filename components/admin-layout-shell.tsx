'use client'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin-sidebar'

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset>
        {/* Mobile-first header: hamburger opens sidebar on mobile, collapses on desktop */}
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center border-b border-border bg-background px-4 sm:h-14 sm:px-6 lg:px-8">
          <SidebarTrigger className="-ml-1 size-9 sm:size-8" aria-label="Abrir menú" />
        </header>
        <div id="main-content" role="main" className="flex-1 overflow-auto" tabIndex={-1}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
