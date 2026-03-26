import type { SupabaseClient } from '@supabase/supabase-js'

type RpcRow = { client_id: string; started_at: string }

/**
 * Última sesión completada por cliente, vía RPC DISTINCT ON (correcto con muchos asesorados / muchas sesiones).
 */
export async function fetchLatestCompletedSessionByClients(
  supabase: SupabaseClient,
  clientIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (clientIds.length === 0) return map

  const { data, error } = await supabase.rpc('latest_completed_session_by_clients', {
    client_ids: clientIds,
  })

  if (error) {
    console.warn('[admin rollups] RPC latest_completed_session_by_clients:', error.message, '— usando consultas por cliente.')
    await fallbackLatestSessionsOnePerClient(supabase, clientIds, map)
    return map
  }

  for (const row of (data || []) as RpcRow[]) {
    if (row.client_id && row.started_at) map.set(row.client_id, row.started_at)
  }
  return map
}

async function fallbackLatestSessionsOnePerClient(
  supabase: SupabaseClient,
  clientIds: string[],
  into: Map<string, string>,
) {
  await Promise.all(
    clientIds.map(async (clientId) => {
      const { data, error: rowErr } = await supabase
        .from('workout_sessions')
        .select('started_at')
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!rowErr && data?.started_at) into.set(clientId, data.started_at)
    }),
  )
}

export type LatestPaidPaymentRow = {
  client_id: string
  period_end: string | null
  paid_at: string | null
}

/**
 * Para cada cliente, el pago marcado como pagado más reciente (period_end opcional para contrastar con membership_end).
 */
export async function fetchLatestPaidPaymentByClients(
  supabase: SupabaseClient,
  clientIds: string[],
): Promise<Map<string, LatestPaidPaymentRow>> {
  const map = new Map<string, LatestPaidPaymentRow>()
  if (clientIds.length === 0) return map

  const { data, error } = await supabase
    .from('payments')
    .select('client_id, period_end, paid_at')
    .in('client_id', clientIds)
    .not('paid_at', 'is', null)
    .order('paid_at', { ascending: false })

  if (error) {
    console.error('[admin rollups] latest payments', error.message)
    return map
  }

  for (const row of data || []) {
    const cid = row.client_id as string
    if (!cid || map.has(cid)) continue
    map.set(cid, {
      client_id: cid,
      period_end: (row.period_end as string | null) ?? null,
      paid_at: (row.paid_at as string | null) ?? null,
    })
  }
  return map
}
