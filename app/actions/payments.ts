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

  // Actualizar vencimiento del cliente según el pago
  if (periodEnd || periodStart || planId) {
    const clientUpdate: Record<string, unknown> = {}
    if (periodStart) clientUpdate.membership_start = periodStart
    if (periodEnd) clientUpdate.membership_end = periodEnd
    if (planId) clientUpdate.current_plan_id = planId
    if (Object.keys(clientUpdate).length > 0) {
      await supabase.from('clients').update(clientUpdate).eq('id', clientId)
    }
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

export async function updatePayment(
  paymentId: string,
  data: { amount?: number; paid_at?: string; payment_method?: string; period_start?: string; period_end?: string; reference?: string }
) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = await createClient()

  const updatePayload: Record<string, unknown> = {}
  if (data.amount != null) updatePayload.amount = data.amount
  if (data.paid_at != null) updatePayload.paid_at = data.paid_at
  if (data.payment_method != null) updatePayload.payment_method = data.payment_method
  if (data.period_start != null) updatePayload.period_start = data.period_start
  if (data.period_end != null) updatePayload.period_end = data.period_end
  if (data.reference != null) updatePayload.reference = data.reference

  if (Object.keys(updatePayload).length === 0) {
    return { success: true }
  }

  const { error } = await supabase
    .from('payments')
    .update(updatePayload)
    .eq('id', paymentId)

  if (error) {
    console.error('Error updating payment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/payments')
  return { success: true }
}

export async function deletePayment(paymentId: string) {
  const user = await getAuthUser()
  const profile = await getUserProfile()

  if (!user || profile?.role !== 'admin') {
    return { success: false, error: 'No autorizado' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('payments').delete().eq('id', paymentId)

  if (error) {
    console.error('Error deleting payment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/payments')
  return { success: true }
}
