import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NewInvitationForm } from './new-invitation-form'
import { InvitationCardsClient, type InvitationCodeItem } from './invitation-cards-client'

function normalizeInvitationRow(row: {
  id: string
  code: string
  email: string | null
  for_role: string | null
  expires_at: string | null
  times_used: number | null
  max_uses: number | null
  is_active: boolean | null
}): InvitationCodeItem {
  return {
    id: row.id,
    code: row.code,
    email: row.email,
    for_role: row.for_role ?? 'client',
    expires_at: row.expires_at,
    times_used: row.times_used ?? 0,
    max_uses: row.max_uses ?? 1,
    is_active: row.is_active ?? false,
  }
}

export default async function AdminInvitationsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()
  
  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/client/dashboard')
  }

  const { data: codesRaw } = await supabase
    .from('invitation_codes')
    .select(
      'id, code, email, for_role, expires_at, times_used, max_uses, is_active',
    )
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const codes: InvitationCodeItem[] = (codesRaw ?? []).map(normalizeInvitationRow)

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-40 border-b bg-background safe-area-pt">
        <div className="container py-4 sm:py-5">
          <h1 className="text-xl font-bold sm:text-2xl">Códigos de invitación</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Genera códigos para que tus asesorados puedan registrarse
          </p>
        </div>
      </header>
      <main className="container flex flex-col gap-6 py-6 sm:py-8">
      {/* Create New Code */}
      <NewInvitationForm />

      {/* List of Codes */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Códigos generados</h2>
          <CardDescription>{codes?.length || 0} códigos en total</CardDescription>
        </div>
        {!codes || codes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-muted-foreground text-center">
                No has generado ningún código todavía
              </p>
            </CardContent>
          </Card>
        ) : (
          <InvitationCardsClient codes={codes} />
        )}
      </div>
      </main>
    </div>
  )
}
