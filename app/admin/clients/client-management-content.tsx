'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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
  Clock, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Trash2, 
  Plus,
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
    <div className="space-y-6">
      {/* Stats Bento */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card className="overflow-hidden border-none bg-primary/5 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none bg-success/5 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <UserCheck className="size-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none bg-destructive/5 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Clock className="size-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expired}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-none bg-warning/5 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <UserX className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.suspended}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Suspendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
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
            filteredClients.map((client) => (
              <Card key={client.id} className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-start justify-between">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 -mr-2">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/clients/${client.id}`}>
                            <Eye className="mr-2 size-4" /> Ver perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/clients/${client.id}/edit`}>
                            <Edit2 className="mr-2 size-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {client.status === 'active' ? (
                          <DropdownMenuItem 
                            className="text-warning focus:text-warning"
                            onClick={() => handleStatusChange(client.id, client.userId, 'suspended')}
                          >
                            <UserX className="mr-2 size-4" /> Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-success focus:text-success"
                            onClick={() => handleStatusChange(client.id, client.userId, 'active')}
                          >
                            <UserCheck className="mr-2 size-4" /> Activar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(client.id)}
                        >
                          <Trash2 className="mr-2 size-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {getStatusBadge(client.status)}
                    {client.planName && (
                      <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">
                        {client.planName}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-muted/30 border border-muted-foreground/5 space-y-1">
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
                    <div className="p-2 rounded-lg bg-muted/30 border border-muted-foreground/5 space-y-1">
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
                      <span className="truncate">Objetivo: {client.goal}</span>
                    </div>
                  )}

                  {client.status === 'pending' && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-[11px] text-primary border border-primary/10">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Pendiente de que el usuario complete su registro</span>
                    </div>
                  )}

                  <Button asChild variant="outline" size="sm" className="w-full mt-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={`/admin/clients/${client.id}`}>Gestionar Asesorado</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
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
