'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Calendar, Mail } from 'lucide-react'

interface PendingClient {
  id: string
  full_name: string
  email: string
  created_at: string
  phone?: string
  goal?: string
}

export default function PendingClientsPage() {
  const [clients, setClients] = useState<PendingClient[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    const loadPendingClients = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('clients')
          .select('id, full_name, email, created_at, phone, goal')
          .eq('admin_approved', false)
          .order('created_at', { ascending: false })

        if (error) throw error
        setClients(data || [])
      } catch (err: any) {
        toast.error('No pudimos cargar la lista de asesorados pendientes. Recarga la página.')
      } finally {
        setLoading(false)
      }
    }

    loadPendingClients()
  }, [])

  const handleApproveClient = async (clientId: string) => {
    setApproving(clientId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('clients')
        .update({
          admin_approved: true,
          approval_date: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', clientId)

      if (error) throw error

      toast.success('¡Asesorado aprobado! Ya puede usar la app.')
      setClients(clients.filter(c => c.id !== clientId))
    } catch (err: any) {
      toast.error('No pudimos aprobar al asesorado. Intenta de nuevo.')
    } finally {
      setApproving(null)
    }
  }

  const handleRejectClient = async (clientId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      toast.success('Solicitud rechazada correctamente.')
      setClients(clients.filter(c => c.id !== clientId))
    } catch (err: any) {
      toast.error('No pudimos rechazar la solicitud. Intenta de nuevo.')
    }
  }

  if (loading) {
    return <div className="container py-8">Cargando...</div>
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Clientes Pendientes</h1>
        <p className="text-muted-foreground">Aprueba o rechaza nuevas solicitudes</p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No hay clientes pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{client.full_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <p className="text-sm text-muted-foreground mt-1">{client.phone}</p>
                    )}
                  </div>
                  <Badge variant="outline">Pendiente</Badge>
                </div>

                {client.goal && (
                  <p className="text-sm mb-4">
                    <span className="font-medium">Objetivo:</span> {client.goal}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(client.created_at).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveClient(client.id)}
                    disabled={approving === client.id}
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </Button>
                  <Button
                    onClick={() => handleRejectClient(client.id)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
