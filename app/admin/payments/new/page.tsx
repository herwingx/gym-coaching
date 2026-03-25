import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NewPaymentForm } from './new-payment-form'

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
      <header className="border-b">
        <div className="container flex items-center gap-3 py-4 sm:gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-1">
            <Link href="/admin/payments" aria-label="Volver a pagos">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold truncate sm:text-2xl">Registrar Nuevo Pago</h1>
        </div>
      </header>

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
