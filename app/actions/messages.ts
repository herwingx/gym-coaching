'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function sendMessage(toUserId: string, content: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('No autenticado')

  const supabase = await createClient()

  const { error } = await supabase.from('messages').insert({
    from_user_id: user.id,
    to_user_id: toUserId,
    content: content.trim(),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/messages')
}

export async function markMessagesAsRead(fromUserId: string) {
  const user = await getAuthUser()
  if (!user) return

  const supabase = await createClient()

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('to_user_id', user.id)
    .eq('from_user_id', fromUserId)
  revalidatePath('/messages')
}
