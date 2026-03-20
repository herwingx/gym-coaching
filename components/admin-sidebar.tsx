'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Dumbbell,
  CreditCard,
  Settings,
  LayoutDashboard,
  LogOut,
  Layers,
  Ticket,
  UserCog,
  MessageCircle,
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
  { label: 'Asesorados', href: '/admin/clients', icon: Users },
  { label: 'Rutinas', href: '/admin/routines', icon: Dumbbell },
  { label: 'Builder', href: '/admin/routines/builder', icon: Layers },
  { label: 'Pagos / Asesorías', href: '/admin/payments', icon: CreditCard },
  { label: 'Mensajes', href: '/admin/messages', icon: MessageCircle },
  { label: 'Invitaciones', href: '/admin/invitations', icon: Ticket },
  { label: 'Configuración', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-12 sm:h-14 flex flex-row items-center px-4 shrink-0 py-0">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:-ml-2">
          <div className="size-8 rounded bg-primary flex items-center justify-center shrink-0 group-data-[collapsible=icon]:size-8">
            <span className="text-primary-foreground font-bold text-xs">GC</span>
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <h1 className="text-sm font-bold truncate leading-none">GymCoach</h1>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">Panel del Coach</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
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
                <Link href="/auth/logout">
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
