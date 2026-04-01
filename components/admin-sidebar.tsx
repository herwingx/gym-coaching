'use client'

import { useMemo, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
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
  Moon,
  Sun,
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
  SidebarTrigger,
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
  const { theme, setTheme } = useTheme()
  const activeHref = useMemo(() => activeMenuHref(path), [path])
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/50 flex flex-row items-center px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0 bg-sidebar/50 backdrop-blur-xl min-h-[76px] sm:min-h-[112px] safe-area-header-pt">
        <div className="flex items-center justify-between w-full gap-3 group-data-[collapsible=icon]:justify-center h-full">
          <div className="flex items-center gap-4 transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden h-full">
            <div className="size-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-border/50 shadow-md bg-primary/10">
              <img 
                src="/android-chrome-512x512.png" 
                alt="RU Coach Logo" 
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <h1 className="text-sm font-black tracking-tight truncate leading-none bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent uppercase">
                RU Coach
              </h1>
              <p className="text-[10px] text-muted-foreground/80 truncate mt-1.5 font-bold uppercase tracking-widest leading-none">Rodrigo Urbina</p>
            </div>
          </div>
          <SidebarTrigger className="shrink-0 size-9 transition-transform hover:scale-110 active:scale-95" />
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

      <SidebarFooter className="border-t border-sidebar-border/50 shrink-0 bg-sidebar/50 backdrop-blur-xl h-[118px] flex flex-col justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip="Cambiar tema"
            >
              {!mounted ? (
                <Moon className="size-4 text-transparent transition-all group-data-[collapsible=icon]:scale-110" />
              ) : theme === 'dark' ? (
                <Sun className="size-4 text-primary transition-all group-data-[collapsible=icon]:scale-110" />
              ) : (
                <Moon className="size-4 transition-all group-data-[collapsible=icon]:scale-110" />
              )}
              <span>Tema {!mounted ? '' : theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cerrar sesión">
              <Link href="/auth/logout" prefetch={false}>
                <LogOut className="size-4 shrink-0 transition-all group-data-[collapsible=icon]:scale-110" />
                <span>Cerrar sesión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
