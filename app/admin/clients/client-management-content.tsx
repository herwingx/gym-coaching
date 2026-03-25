'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AdminKpiStatCard } from '@/components/admin/admin-kpi-stat-card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AdminCardWithActions,
  AdminCardHeaderWithActions,
  type AdminCardMenuSection,
} from '@/components/admin/admin-card-with-actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserCheck, 
  UserX, 
  CalendarX,
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Dumbbell,
  Target,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { deleteClient, updateClientStatus } from '@/app/actions/clients'
import { updateUserSubscription } from '@/app/actions/invitations'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getGoalLabel } from '@/lib/constants'

const CLIENT_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  expired: 'Vencido',
  suspended: 'Suspendido',
  inactive: 'Inactivo',
  pending: 'Pendiente',
}

export type ClientManagementCard = {
  id: string
  userId?: string | null
  fullName: string
  email?: string | null
  phone?: string | null
  avatarUrl?: string | null
  status: string
  membershipEnd?: string | null
  goal?: string | null
  experienceLevel?: string | null
  lastSessionAt?: string | null
  daysSinceLastSession?: number | null
  planName?: string | null
  assignedRoutineName?: string | null
  createdAt: string
}

interface ClientManagementContentProps {
  clients: ClientManagementCard[]
}

export function ClientManagementContent({ clients: initialClients }: ClientManagementContentProps) {
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch = 
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      
      if (!matchesSearch) return false

      if (activeTab === 'all') return true
      if (activeTab === 'active') return c.status === 'active'
      if (activeTab === 'pending') return c.status === 'pending'
      if (activeTab === 'expired') return c.status === 'expired'
      if (activeTab === 'suspended') return c.status === 'suspended'
      
      return true
    })
  }, [clients, search, activeTab])

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      expired: clients.filter(c => c.status === 'expired').length,
      suspended: clients.filter(c => c.status === 'suspended').length,
      pending: clients.filter(c => c.status === 'pending').length,
    }
  }, [clients])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const result = await deleteClient(deleteId)
      if (result.success) {
        setClients(clients.filter(c => c.id !== deleteId))
        toast.success('¡Asesorado eliminado correctamente!')
      } else {
        toast.error('No pudimos eliminar al asesorado. Intenta de nuevo.')
      }
    } catch (error) {
      toast.error('No pudimos eliminar al asesorado. Revisa tu conexión.')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleStatusChange = async (clientId: string, userId: string | null | undefined, newStatus: string) => {
    try {
      const result = await updateClientStatus(clientId, newStatus)
      if (result.success) {
        setClients(clients.map(c => c.id === clientId ? { ...c, status: newStatus } : c))
        const label =
          CLIENT_STATUS_LABELS[newStatus.toLowerCase()] ?? 'actualizado'
        toast.success(`Asesorado marcado como «${label}».`)
      } else {
        toast.error('No pudimos cambiar el estado. Intenta de nuevo.')
      }
    } catch (error) {
      toast.error('No pudimos cambiar el estado. Revisa tu conexión.')
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      active: { label: 'Activo', variant: 'default', className: 'bg-success/15 text-success border-success/30' },
      expired: { label: 'Vencido', variant: 'destructive' },
      suspended: { label: 'Suspendido', variant: 'outline', className: 'border-amber-500/50 text-amber-700 dark:text-amber-400' },
      inactive: { label: 'Inactivo', variant: 'secondary' },
      pending: { label: 'Pendiente', variant: 'outline', className: 'border-primary/50 text-primary' },
    }
    const { label, className } = config[status.toLowerCase()] ?? { label: status, className: '' }
    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs — mismo patrón que el dashboard del coach; color solo en el pozo del icono */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <AdminKpiStatCard icon={Users} value={stats.total} label="Total" tone="primary" />
        <AdminKpiStatCard icon={UserCheck} value={stats.active} label="Activos" tone="success" />
        <AdminKpiStatCard
          icon={CalendarX}
          value={stats.expired}
          label="Vencidos"
          tone="destructive"
        />
        <AdminKpiStatCard icon={UserX} value={stats.suspended} label="Suspendidos" tone="warning" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-5 sm:w-auto">
              <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Activos</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pendientes</TabsTrigger>
              <TabsTrigger value="expired" className="text-xs">Vencidos</TabsTrigger>
              <TabsTrigger value="suspended" className="text-xs">Susp.</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground">No se encontraron asesorados</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const menuSections: AdminCardMenuSection[] = [
                {
                  items: [
                    { label: 'Ver perfil', icon: <Eye className="mr-2 size-4" />, href: `/admin/clients/${client.id}` },
                    { label: 'Editar', icon: <Edit2 className="mr-2 size-4" />, href: `/admin/clients/${client.id}/edit` },
                  ],
                },
                {
                  separatorBefore: true,
                  items: [
                    client.status === 'active'
                      ? {
                          label: 'Suspender',
                          icon: <UserX className="mr-2 size-4" />,
                          onClick: () => handleStatusChange(client.id, client.userId, 'suspended'),
                          className: 'text-warning focus:text-warning',
                        }
                      : {
                          label: 'Activar',
                          icon: <UserCheck className="mr-2 size-4" />,
                          onClick: () => handleStatusChange(client.id, client.userId, 'active'),
                          className: 'text-success focus:text-success',
                        },
                  ],
                },
                {
                  separatorBefore: true,
                  items: [
                    {
                      label: 'Eliminar',
                      icon: <Trash2 className="mr-2 size-4" />,
                      onClick: () => setDeleteId(client.id),
                      variant: 'destructive' as const,
                    },
                  ],
                },
              ]
              return (
              <AdminCardWithActions key={client.id} menuSections={menuSections}>
                <AdminCardHeaderWithActions menuSections={menuSections}>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 rounded-xl border-2 border-background shadow-sm">
                      {client.avatarUrl ? (
                        <AvatarImage src={client.avatarUrl} alt={client.fullName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {client.fullName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate leading-none mb-1">
                        {client.fullName}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {client.email || 'Sin email'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {getStatusBadge(client.status)}
                    {client.planName && (
                      <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">
                        {client.planName}
                      </Badge>
                    )}
                  </div>
                </AdminCardHeaderWithActions>
                <CardContent className="flex flex-col gap-3 p-4 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1 rounded-lg border border-muted-foreground/5 bg-muted/30 p-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                        <Dumbbell className="size-3" />
                        Último Entreno
                      </div>
                      <p className="text-xs font-semibold">
                        {client.lastSessionAt 
                          ? format(new Date(client.lastSessionAt), "d MMM", { locale: es })
                          : 'Nunca'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg border border-muted-foreground/5 bg-muted/30 p-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                        <Calendar className="size-3" />
                        Vencimiento
                      </div>
                      <p className="text-xs font-semibold">
                        {client.membershipEnd 
                          ? format(new Date(client.membershipEnd), "d MMM yyyy", { locale: es })
                          : 'Sin fecha'}
                      </p>
                    </div>
                  </div>

                  {client.goal && (
                    <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                      <Target className="size-3.5 text-primary" />
                      <span className="truncate">Objetivo: {getGoalLabel(client.goal)}</span>
                    </div>
                  )}

                  {client.status === 'pending' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-[11px] text-primary border border-primary/10">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Pendiente de que el usuario complete su registro</span>
                    </div>
                  )}
                </CardContent>
              </AdminCardWithActions>
            )
            })
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar asesorado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al cliente (sesiones, medidas, fotos, notas).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
