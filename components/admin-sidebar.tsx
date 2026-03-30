'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useLayoutBasePath } from '@/hooks/use-layout-base-path'
import {
  Users,
  Dumbbell,
  CreditCard,
  Settings,
  LayoutDashboard,
  LogOut,
  Layers,
  Ticket,
  MessageCircle,
  Library,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Gestionar Asesorados', href: '/admin/clients', icon: Users },
  { label: 'Rutinas', href: '/admin/routines', icon: Dumbbell },
  { label: 'Ejercicios', href: '/admin/exercises', icon: Library },
  { label: 'Builder', href: '/admin/routines/builder', icon: Layers },
  { label: 'Pagos / Asesorías', href: '/admin/payments', icon: CreditCard },
  { label: 'Mensajes', href: '/admin/messages', icon: MessageCircle },
  { label: 'Invitaciones', href: '/admin/invitations', icon: Ticket },
  { label: 'Configuración', href: '/admin/settings', icon: Settings },
]

/** Longest href wins so /admin/routines/builder activates Builder, not Rutinas. */
function activeMenuHref(path: string): string | null {
  if (!path) return null
  const ordered = [...menuItems].sort((a, b) => b.href.length - a.href.length)
  for (const item of ordered) {
    if (path === item.href) return item.href
    if (item.href === '/admin/dashboard') continue
    if (path.startsWith(`${item.href}/`)) return item.href
  }
  return null
}

export function AdminSidebar() {
  const path = useLayoutBasePath('/admin')
  const activeHref = useMemo(() => activeMenuHref(path), [path])

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-12 sm:h-14 flex flex-row items-center px-4 shrink-0 py-0 bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:-ml-2">
          <div className="size-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 group-data-[collapsible=icon]:size-8 ring-1 ring-border/50 shadow-sm">
            <img 
              src="/android-chrome-512x512.png" 
              alt="RU Coach Logo" 
              className="size-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <h1 className="text-sm font-black tracking-tight truncate leading-none bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent uppercase">
              RU Coach
            </h1>
            <p className="text-[9px] text-muted-foreground/80 truncate mt-1 font-medium uppercase tracking-wider">Rodrigo Urbina</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeHref === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive && "bg-primary/10 text-primary hover:bg-primary/20 font-bold"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Cerrar sesión">
                <Link href="/auth/logout" prefetch={false}>
                  <LogOut className="size-4 shrink-0" />
                  <span>Cerrar sesión</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
