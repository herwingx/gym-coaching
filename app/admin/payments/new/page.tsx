import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewPaymentForm } from './new-payment-form'
import { AdminPageHeader } from '@/components/admin/admin-page-header'

type MembershipPlanRow = {
  id: string
  name: string
  price: number
  duration_days: number
}

export default async function NewPaymentPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get list of clients
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, email')
    .eq('coach_id', user.id)
    .eq('status', 'active')
    .order('full_name')

  // Get membership plans
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('id, name, price, duration_days')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="bg-background">
      <AdminPageHeader
        title="Registrar Nuevo Pago"
        backHref="/admin/payments"
        backLabel="Volver a pagos"
      />

      <main className="container py-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          <NewPaymentForm
            clients={clients || []}
            plans={(plans ?? []) as MembershipPlanRow[]}
          />
        </div>
      </main>
    </div>
  )
}
