import { createClient } from '@/lib/supabase/server'
import { Client } from '@/lib/types'

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data || []
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  return data
}

export async function getClientByUserId(userId: string): Promise<Client | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching client by user_id:', error)
    return null
  }

  return data
}

export async function deleteClientById(clientId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    console.error('Error deleting client:', error)
    throw error
  }
}
