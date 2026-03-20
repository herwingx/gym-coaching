'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getUserProfile } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function registerPayment(formData: FormData) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()

  const clientId = formData.get('clientId') as string
  const amount = formData.get('amount') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const planId = formData.get('planId') as string
  const periodStart = formData.get('periodStart') as string
  const periodEnd = formData.get('periodEnd') as string
  const reference = formData.get('reference') as string

  const { error } = await supabase
    .from('payments')
    .insert([
      {
        id: randomUUID(),
        client_id: clientId,
        amount: parseFloat(amount),
        payment_method: paymentMethod || null,
        plan_id: planId || null,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        reference: reference || null,
        paid_at: new Date().toISOString(),
      },
    ])

  if (error) {
    console.error('Error creating payment:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/payments')
  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${clientId}`)
  redirect('/admin/payments')
}

export async function markPaymentAsPaid(paymentId: string) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('payments')
    .update({
      paid_at: new Date().toISOString(),
    })
    .eq('id', paymentId)

  if (error) {
    console.error('Error marking payment as paid:', error)
    throw new Error(error.message)
  }

  return { success: true }
}
