import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GymSettingsForm } from './gym-settings-form'
import { Dumbbell, Settings2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function AdminSettingsPage() {
  const user = await getAuthUser()

  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/client/dashboard')

  const { data: gymSettings } = await supabase
    .from('gym_settings')
    .select('gym_name, phone, schedule, currency, timezone')
    .eq('admin_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background/50">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container py-6">
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Administra tu negocio y preferencias</p>
        </div>
      </header>

      <main className="container py-10">
        <div className="grid gap-8 max-w-3xl mx-auto">
          <section>
            <GymSettingsForm
              initialData={gymSettings ? {
                gym_name: gymSettings.gym_name,
                phone: gymSettings.phone ?? undefined,
                schedule: gymSettings.schedule ?? undefined,
                currency: gymSettings.currency ?? 'MXN',
                timezone: gymSettings.timezone ?? 'America/Mexico_City',
              } : null}
            />
          </section>

          <section>
            <Card className="overflow-hidden border-dashed bg-muted/30">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">Biblioteca de Ejercicios</CardTitle>
                  <CardDescription>Catálogo de movimientos personalizados para tus rutinas</CardDescription>
                </div>
                <Badge variant="secondary" className="font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
                  Próximamente
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="py-6 px-4 rounded-xl border border-dashed border-muted-foreground/20 bg-background/50 flex flex-col items-center text-center space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Personaliza tus propios ejercicios</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Podrás subir tus propios videos, descripciones y categorías para que tus asesorados tengan la mejor experiencia visual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
