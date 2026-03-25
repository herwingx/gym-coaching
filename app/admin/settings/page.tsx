import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GymSettingsForm } from './gym-settings-form'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Dumbbell, Globe2 } from 'lucide-react'

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container py-5">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              Ajustes del panel
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Configuración</h1>
            <p className="text-sm text-muted-foreground">
              Administra los datos de tu negocio y la experiencia de tus asesorados.
            </p>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-dashed">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{gymSettings?.gym_name ?? 'Mi marca'}</p>
                  <p className="text-xs text-muted-foreground">Nombre comercial</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Dumbbell className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{gymSettings?.currency ?? 'MXN'}</p>
                  <p className="text-xs text-muted-foreground">Moneda activa</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Globe2 className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{gymSettings?.timezone ?? 'America/Mexico_City'}</p>
                  <p className="text-xs text-muted-foreground">Zona horaria</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="general" className="flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-fit">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-0">
              <GymSettingsForm
                initialData={gymSettings ? {
                  gym_name: gymSettings.gym_name,
                  phone: gymSettings.phone ?? undefined,
                  schedule: gymSettings.schedule ?? undefined,
                  currency: gymSettings.currency ?? 'MXN',
                  timezone: gymSettings.timezone ?? 'America/Mexico_City',
                } : null}
              />
            </TabsContent>

            <TabsContent value="biblioteca" className="mt-0">
              <Card className="overflow-hidden border-dashed bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">Biblioteca de Ejercicios</CardTitle>
                    <CardDescription>Catálogo de movimientos personalizados para tus rutinas</CardDescription>
                  </div>
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
                    Próximamente
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-background/50 px-4 py-6 text-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">Personaliza tus propios ejercicios</p>
                      <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                        Podrás subir videos, descripciones y categorías para mejorar la experiencia visual de tus asesorados.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
