import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { deactivateInvitationCode } from '@/app/actions/invitations'
import { CopyInviteButton } from './copy-invite-button'
import { NewInvitationForm } from './new-invitation-form'
import { Trash2 } from 'lucide-react'

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

  // Get all invitation codes
  const { data: codes } = await supabase
    .from('invitation_codes')
    .select('*')
    .order('created_at', { ascending: false })

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
      <main className="container py-6 space-y-6 sm:py-8">

      {/* Create New Code */}
      <NewInvitationForm />

      {/* List of Codes */}

      {/* List of Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Códigos generados</CardTitle>
          <CardDescription>
            {codes?.length || 0} códigos en total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!codes || codes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No has generado ningún código todavía
            </p>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => {
                const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                const isUsed = code.times_used >= code.max_uses
                const isInactive = !code.is_active

                return (
                  <div 
                    key={code.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isInactive || isExpired || isUsed ? 'opacity-50 bg-muted' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold text-primary">
                          {code.code}
                        </code>
                        {isUsed && (
                          <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/20">
                            Usado
                          </Badge>
                        )}
                        {isExpired && !isUsed && (
                          <Badge variant="secondary" className="bg-destructive/20 text-destructive hover:bg-destructive/20">
                            Expirado
                          </Badge>
                        )}
                        {isInactive && (
                          <Badge variant="secondary" className="bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/20">
                            Desactivado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {code.email ? `Para: ${code.email}` : 'Cualquier email'}
                        {' • '}
                        {code.for_role === 'admin' ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/50">Coach</Badge>
                        ) : (
                          'Cliente'
                        )}
                        {' • '}
                        Expira: {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Nunca'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isInactive && !isUsed && (
                        <>
                          <CopyInviteButton code={code.code} />
                          <form action={async () => {
                            'use server'
                            await deactivateInvitationCode(code.id)
                          }}>
                            <Button variant="ghost" size="icon" type="submit">
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  )
}
