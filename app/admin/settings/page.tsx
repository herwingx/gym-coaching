import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GymSettingsForm } from './gym-settings-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Dumbbell, Globe2, Library } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CoachProfileSettings } from '@/components/admin/coach-profile-settings'

export default async function AdminSettingsPage() {
  const user = await getAuthUser()

  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
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
      <AdminPageHeader
        sticky
        title="Configuración"
        description="Administra los datos de tu negocio y la experiencia de tus asesorados."
      />

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

          <Tabs defaultValue="profile" className="flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-3 sm:w-fit">
              <TabsTrigger value="profile">Mi perfil</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-0">
              <CoachProfileSettings
                userId={user.id}
                initialFullName={profile?.full_name}
                initialAvatarUrl={profile?.avatar_url}
              />
            </TabsContent>
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
                    <CardTitle className="text-lg">Biblioteca de ejercicios</CardTitle>
                    <CardDescription>Catálogo con GIF, técnica y altas nuevas — mismo listado que en el menú lateral.</CardDescription>
                  </div>
                  <Button asChild variant="secondary" size="sm" className="shrink-0">
                    <Link href="/admin/exercises">
                      <Library data-icon="inline-start" />
                      Abrir catálogo
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-background/50 px-4 py-6 text-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">Añade movimientos y revisa demostraciones</p>
                      <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                        Desde el catálogo puedes abrir la ficha completa (como la ve el asesorado) y crear ejercicios con URL de GIF o imagen.
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
