import { getAuthUser } from '@/lib/auth-utils'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { EditPaymentForm } from './edit-payment-form'

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const { paymentId } = await params
  const supabase = await createClient()

  const { data: payment } = await supabase
    .from('payments')
    .select(`
      *,
      clients (full_name, email)
    `)
    .eq('id', paymentId)
    .single()

  if (!payment) notFound()

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-header-pt">
        <div className="container py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="size-9">
            <Link href="/admin/payments">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Editar pago</h1>
            <p className="text-sm text-muted-foreground">
              {payment.clients?.full_name} • ${payment.amount?.toFixed(2)}
            </p>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <EditPaymentForm payment={payment} />
      </main>
    </div>
  )
}
