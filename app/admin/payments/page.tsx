import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPaymentsPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()
  
  // Get all payments with client info
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      clients (full_name, email)
    `)
    .order('created_at', { ascending: false })

  // Calculate statistics
  const totalRevenue = payments?.reduce((sum, p) => 
    p.paid_at ? sum + (p.amount || 0) : sum, 0) || 0
  
  const pendingAmount = payments?.reduce((sum, p) => 
    !p.paid_at ? sum + (p.amount || 0) : sum, 0) || 0

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Pagos y Membresías</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Ingresos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Pagos completados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pagos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Por cobrar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{payments?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Registrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Historial de Pagos</CardTitle>
              <Button asChild size="sm">
                <Link href="/admin/payments/new">
                  <Plus className="size-4 mr-2" />
                  Nuevo Pago
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!payments || payments.length === 0 ? (
                <p className="text-muted-foreground">
                  No hay pagos registrados aún.
                </p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">
                          {payment.clients?.full_name || 'Cliente desconocido'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.paid_at 
                            ? new Date(payment.paid_at).toLocaleDateString()
                            : 'Pendiente'
                          } {payment.payment_method && `• ${payment.payment_method}`}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">${payment.amount?.toFixed(2) || '0.00'}</p>
                        <Badge 
                          variant="secondary"
                          className={payment.paid_at 
                            ? 'bg-success/20 text-success hover:bg-success/20' 
                            : 'bg-warning/20 text-warning-foreground hover:bg-warning/20'
                          }
                        >
                          {payment.paid_at ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
