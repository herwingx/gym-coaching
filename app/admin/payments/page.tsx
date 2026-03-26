import { getAuthData } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, CreditCard, Hourglass, ClipboardList } from 'lucide-react'
import { AdminKpiStatCard } from '@/components/admin/admin-kpi-stat-card'
import { createClient } from '@/lib/supabase/server'
import { PaymentCardsClient, type PaymentCardItem } from './payment-cards-client'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

type PaymentQueryRow = {
  id: string
  client_id: string
  amount: number
  paid_at: string | null
  payment_method: string | null
  clients:
    | { full_name: string; email?: string | null }
    | { full_name: string; email?: string | null }[]
    | null
}

function toPaymentCardItem(row: PaymentQueryRow): PaymentCardItem {
  const rel = row.clients
  const clients =
    rel == null ? null : Array.isArray(rel) ? rel[0] ?? null : rel
  return {
    id: row.id,
    client_id: row.client_id,
    amount: row.amount,
    paid_at: row.paid_at,
    payment_method: row.payment_method,
    clients,
  }
}

export default async function AdminPaymentsPage() {
  const { user, role } = await getAuthData()

  if (!user || role !== 'admin') {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  const { data: coachClients } = await supabase
    .from('clients')
    .select('id')
    .eq('coach_id', user.id)

  const clientIds = (coachClients ?? []).map((c) => c.id).filter(Boolean)

  let payments: PaymentCardItem[] = []
  if (clientIds.length > 0) {
    const { data } = await supabase
      .from('payments')
      .select(
        `
        id,
        client_id,
        amount,
        paid_at,
        payment_method,
        clients (full_name, email)
      `,
      )
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })

    payments = (data ?? []).map((row) => toPaymentCardItem(row as PaymentQueryRow))
  }

  // Calculate statistics
  const totalRevenue = payments.reduce((sum, p) =>
    p.paid_at ? sum + (p.amount || 0) : sum, 0)

  const pendingAmount = payments.reduce((sum, p) =>
    !p.paid_at ? sum + (p.amount || 0) : sum, 0)

  return (
    <div className="bg-background">
      <AdminPageHeader sticky title="Pagos y Membresías" />

      <main className="container py-8">
        <div className="grid gap-6">
          {/* Stats */}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
            <AdminKpiStatCard
              icon={CreditCard}
              value={`$${totalRevenue.toFixed(2)}`}
              label="Ingresos Totales"
              description="Pagos completados"
            />
            <AdminKpiStatCard
              icon={Hourglass}
              value={`$${pendingAmount.toFixed(2)}`}
              label="Pagos Pendientes"
              description="Por cobrar"
            />
            <AdminKpiStatCard
              icon={ClipboardList}
              value={payments.length}
              label="Total de Pagos"
              description="Registrados"
            />
          </div>

          {/* Payments List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Historial de Pagos</h2>
              <Button asChild size="sm">
                <Link href="/admin/payments/new">
                  <Plus className="size-4 mr-2" />
                  Nuevo Pago
                </Link>
              </Button>
            </div>
            {payments.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    No hay pagos registrados aún.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <PaymentCardsClient payments={payments} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
